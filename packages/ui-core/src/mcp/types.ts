export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export interface PackageIdentity {
  name: string;
  version: string;
}

export interface ToolErrorPayload {
  code: string;
  message: string;
  details?: JsonObject;
}

export interface ToolSuccessResult {
  ok: true;
  data: JsonObject;
}

export interface ToolErrorResult {
  ok: false;
  error: ToolErrorPayload;
}

export type ToolResult = ToolSuccessResult | ToolErrorResult;

export class ToolError extends Error {
  readonly code: string;
  readonly details?: JsonObject;

  constructor(code: string, message: string, details?: JsonObject) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
