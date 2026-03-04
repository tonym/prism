import { spawn } from 'node:child_process';

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildMcpMessage(payload) {
  const body = JSON.stringify(payload);
  return `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`;
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
    this.buffer = '';
    this.nextId = 1;
    this.pending = new Map();
    this.stderrTail = [];
  }

  async start() {
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

    this.process.stdout.setEncoding('utf8');
    this.process.stdout.on('data', (chunk) => {
      this.buffer += chunk;
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
      120_000
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
        reject(new Error(`MCP request timed out after ${timeoutMs}ms: ${method}`));
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
      throw new Error(`MCP tool \"${name}\" returned an error result.`);
    }

    return parseTextContent(response);
  }

  #drainBuffer() {
    while (true) {
      const headerBoundary = this.buffer.indexOf('\r\n\r\n');

      if (headerBoundary < 0) {
        return;
      }

      const header = this.buffer.slice(0, headerBoundary);
      const contentLengthMatch = header.match(/content-length:\s*(\d+)/i);

      if (!contentLengthMatch) {
        this.buffer = this.buffer.slice(headerBoundary + 4);
        continue;
      }

      const contentLengthRaw = contentLengthMatch[1];

      if (!contentLengthRaw) {
        this.buffer = this.buffer.slice(headerBoundary + 4);
        continue;
      }

      const contentLength = Number.parseInt(contentLengthRaw, 10);
      const bodyStart = headerBoundary + 4;
      const bodyEnd = bodyStart + contentLength;

      if (this.buffer.length < bodyEnd) {
        return;
      }

      const body = this.buffer.slice(bodyStart, bodyEnd);
      this.buffer = this.buffer.slice(bodyEnd);

      const message = safeJsonParse(body);

      if (!message || typeof message !== 'object' || message.id === undefined) {
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
