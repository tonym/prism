import { UiCoreArtifactStore } from './artifact-store.js';
import { createToolHandlersV1, toolDefinitionsV1, type ToolDefinition, type ToolHandler } from './tools.js';
import type { JsonObject, ToolResult } from './types.js';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: unknown;
}

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_NAME = 'prism-ui-core-mcp';

function toErrorPayload(code: number, message: string, data?: JsonObject): Record<string, unknown> {
  return {
    code,
    message,
    data: data ?? null
  };
}

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const objectValue = value as Record<string, unknown>;
  return objectValue.jsonrpc === '2.0' && typeof objectValue.method === 'string';
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractParamsObject(params: unknown): JsonObject {
  if (!isJsonObject(params)) {
    return {};
  }

  return params;
}

function toToolCallResult(result: ToolResult): Record<string, unknown> {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.ok,
    structuredContent: result
  };
}

export interface UiCoreMcpServerOptions {
  rootDirectory?: string;
}

export class UiCoreMcpServer {
  readonly store: UiCoreArtifactStore;
  readonly tools: Readonly<Record<string, ToolHandler>>;
  readonly toolDefinitions: readonly ToolDefinition[];
  private readonly serverVersion: string;
  private buffer = '';

  constructor(options: UiCoreMcpServerOptions = {}) {
    this.store = new UiCoreArtifactStore(options.rootDirectory);
    this.tools = createToolHandlersV1(this.store);
    this.toolDefinitions = toolDefinitionsV1();
    this.serverVersion = this.store.packageIdentity.version;
  }

  start(): void {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => {
      this.buffer += chunk;
      this.drainBuffer();
    });
    process.stdin.on('error', (error: unknown) => {
      this.writeLog(`stdin error: ${String(error)}`);
    });
  }

  private writeLog(message: string): void {
    process.stderr.write(`${message}\n`);
  }

  private drainBuffer(): void {
    while (true) {
      const headerBoundary = this.buffer.indexOf('\r\n\r\n');

      if (headerBoundary < 0) {
        return;
      }

      const headerChunk = this.buffer.slice(0, headerBoundary);
      const contentLengthMatch = headerChunk.match(/content-length:\s*(\d+)/i);

      if (!contentLengthMatch) {
        this.writeLog('Skipping malformed message without Content-Length header.');
        this.buffer = this.buffer.slice(headerBoundary + 4);
        continue;
      }

      const contentLengthRaw = contentLengthMatch[1];

      if (!contentLengthRaw) {
        this.writeLog('Skipping malformed message with empty Content-Length.');
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
      this.handleRawMessage(body);
    }
  }

  private handleRawMessage(body: string): void {
    let payload: unknown;

    try {
      payload = JSON.parse(body);
    } catch {
      this.writeLog('Failed to parse JSON-RPC payload.');
      return;
    }

    if (!isJsonRpcRequest(payload)) {
      this.writeLog('Ignoring payload that is not a JSON-RPC request.');
      return;
    }

    const request = payload;
    const response = this.handleRequest(request);

    if (response) {
      this.send(response);
    }
  }

  private handleRequest(request: JsonRpcRequest): JsonRpcResponse | undefined {
    if (request.method === 'notifications/initialized') {
      return undefined;
    }

    if (request.id === undefined) {
      return undefined;
    }

    if (request.method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: SERVER_NAME,
            version: this.serverVersion
          }
        }
      };
    }

    if (request.method === 'ping') {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {}
      };
    }

    if (request.method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: this.toolDefinitions
        }
      };
    }

    if (request.method === 'tools/call') {
      const params = extractParamsObject(request.params);
      const toolName = typeof params.name === 'string' ? params.name : '';
      const handler = this.tools[toolName];

      if (!handler) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: toErrorPayload(-32602, `Unknown tool "${toolName}".`, {
            toolName
          })
        };
      }

      const toolResult = handler(params.arguments);

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: toToolCallResult(toolResult)
      };
    }

    return {
      jsonrpc: '2.0',
      id: request.id,
      error: toErrorPayload(-32601, `Method "${request.method}" not found.`)
    };
  }

  private send(payload: JsonRpcResponse): void {
    const serialized = JSON.stringify(payload);
    const message = `Content-Length: ${Buffer.byteLength(serialized, 'utf8')}\r\n\r\n${serialized}`;
    process.stdout.write(message);
  }
}
