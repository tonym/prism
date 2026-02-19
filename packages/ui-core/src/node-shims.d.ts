declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: 'base64'): string;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function statSync(path: string): {
    size: number;
    mtimeMs: number;
  };
  export function writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

declare module 'node:path' {
  const path: {
    basename(value: string): string;
    extname(value: string): string;
    join(...paths: string[]): string;
    relative(from: string, to: string): string;
    resolve(...paths: string[]): string;
  };

  export default path;
}

declare module 'node:url' {
  export function pathToFileURL(path: string): { href: string };
}

declare const process: {
  argv: string[];
  cwd(): string;
  exit(code?: number): never;
  stdin: {
    on(event: 'data', listener: (chunk: string) => void): void;
    on(event: 'error', listener: (error: unknown) => void): void;
    setEncoding(encoding: 'utf8'): void;
  };
  stdout: {
    write(value: string): void;
  };
  stderr: {
    write(value: string): void;
  };
};

declare const console: {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  log(message?: unknown, ...optionalParams: unknown[]): void;
};

declare const Buffer: {
  byteLength(value: string, encoding?: 'utf8'): number;
};

interface ImportMeta {
  url: string;
}
