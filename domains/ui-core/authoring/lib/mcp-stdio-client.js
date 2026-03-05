import { spawn } from 'node:child_process';

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildMcpMessage(payload) {
  return `${JSON.stringify(payload)}\n`;
}

export function parseNextMcpFrame(buffer) {
  const newlineIndex = buffer.indexOf(0x0a);

  if (newlineIndex < 0) {
    return null;
  }

  let lineBuffer = buffer.subarray(0, newlineIndex);

  if (lineBuffer.length > 0 && lineBuffer[lineBuffer.length - 1] === 0x0d) {
    lineBuffer = lineBuffer.subarray(0, lineBuffer.length - 1);
  }

  const line = lineBuffer.toString('utf8').trim();
  const message = line.length === 0 ? null : safeJsonParse(line);

  return {
    message,
    remaining: buffer.subarray(newlineIndex + 1)
  };
}

function parseTextContent(result) {
  if (result && typeof result === 'object' && result.structuredContent && typeof result.structuredContent === 'object') {
    return result.structuredContent;
  }

  const content = Array.isArray(result?.content) ? result.content : [];
  const firstText = content.find((entry) => entry && entry.type === 'text' && typeof entry.text === 'string');

  if (!firstText || typeof firstText.text !== 'string') {
    throw new Error('MCP tool result does not contain structured content or text payload.');
  }

  const parsed = safeJsonParse(firstText.text);

  if (parsed === null) {
    throw new Error('MCP tool text payload is not valid JSON.');
  }

  return parsed;
}

export class StdioMcpClient {
  constructor(config) {
    this.config = config;
    this.process = null;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.stderrTail = [];
  }

  async start(initializeTimeoutMs = 120_000) {
    if (this.process) {
      return;
    }

    this.process = spawn(this.config.command, this.config.args, {
      env: {
        ...process.env,
        ...this.config.env
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.process.stdout.on('data', (chunk) => {
      const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8');
      this.buffer = this.buffer.length === 0 ? chunkBuffer : Buffer.concat([this.buffer, chunkBuffer]);
      this.#drainBuffer();
    });

    this.process.stderr.setEncoding('utf8');
    this.process.stderr.on('data', (chunk) => {
      for (const line of chunk.split('\n')) {
        if (line.length === 0) {
          continue;
        }

        this.stderrTail.push(line);

        if (this.stderrTail.length > 40) {
          this.stderrTail.shift();
        }
      }

      if (process.env.PRISM_FIGMA_ALIGN_DEBUG === '1') {
        process.stderr.write(chunk);
      }
    });

    this.process.on('exit', (code, signal) => {
      const stderrSummary = this.stderrTail.length > 0 ? ` stderr=${this.stderrTail.join(' | ')}` : '';
      const reason =
        `MCP process exited before responding (code=${code ?? 'null'}, signal=${signal ?? 'null'}).` +
        stderrSummary;

      for (const pending of this.pending.values()) {
        pending.reject(new Error(reason));
      }

      this.pending.clear();
      this.process = null;
    });

    this.process.on('error', (error) => {
      const reason = `Failed to start MCP process: ${error.message}`;

      for (const pending of this.pending.values()) {
        pending.reject(new Error(reason));
      }

      this.pending.clear();
      this.process = null;
    });

    const initializeResult = await this.request(
      'initialize',
      {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'prism-ui-core-authoring',
          version: '1.0.0'
        }
      },
      initializeTimeoutMs
    );

    this.notify('notifications/initialized', {});
    return initializeResult;
  }

  async close() {
    if (!this.process) {
      return;
    }

    this.process.kill();
    this.process = null;
    this.pending.clear();
  }

  notify(method, params) {
    if (!this.process) {
      throw new Error('MCP client is not started.');
    }

    this.process.stdin.write(
      buildMcpMessage({
        jsonrpc: '2.0',
        method,
        params
      })
    );
  }

  request(method, params, timeoutMs = 30_000) {
    if (!this.process) {
      throw new Error('MCP client is not started.');
    }

    const id = this.nextId;
    this.nextId += 1;

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pending.delete(id);
        const stderrSummary =
          this.stderrTail.length > 0
            ? ` Recent MCP stderr: ${this.stderrTail.slice(-8).join(' | ')}`
            : '';

        reject(new Error(`MCP request timed out after ${timeoutMs}ms: ${method}.${stderrSummary}`));
      }, timeoutMs);

      this.pending.set(id, {
        resolve,
        reject,
        timeoutHandle
      });

      this.process.stdin.write(
        buildMcpMessage({
          jsonrpc: '2.0',
          id,
          method,
          params
        })
      );
    });
  }

  async callTool(name, args, timeoutMs = 60_000) {
    const response = await this.request(
      'tools/call',
      {
        name,
        arguments: args
      },
      timeoutMs
    );

    if (response && typeof response === 'object' && response.isError) {
      let detail = '';

      try {
        const parsedError = parseTextContent(response);

        if (parsedError && typeof parsedError === 'object') {
          if (typeof parsedError.error === 'string') {
            detail = parsedError.error;
          } else if (typeof parsedError.message === 'string') {
            detail = parsedError.message;
          } else {
            detail = JSON.stringify(parsedError);
          }
        }
      } catch {
        // Fallback to the generic tool error when content parsing fails.
      }

      throw new Error(
        detail.length > 0
          ? `MCP tool \"${name}\" returned an error result: ${detail}`
          : `MCP tool \"${name}\" returned an error result.`
      );
    }

    return parseTextContent(response);
  }

  #drainBuffer() {
    while (true) {
      const parsedFrame = parseNextMcpFrame(this.buffer);

      if (!parsedFrame) {
        return;
      }

      this.buffer = parsedFrame.remaining;

      const message = parsedFrame.message;

      if (!message || typeof message !== 'object' || !Object.prototype.hasOwnProperty.call(message, 'id')) {
        continue;
      }

      const pending = this.pending.get(message.id);

      if (!pending) {
        continue;
      }

      clearTimeout(pending.timeoutHandle);
      this.pending.delete(message.id);

      if (message.error) {
        const errorMessage = typeof message.error?.message === 'string' ? message.error.message : JSON.stringify(message.error);
        pending.reject(new Error(`MCP request error: ${errorMessage}`));
        continue;
      }

      pending.resolve(message.result);
    }
  }
}
