declare module 'node:fs' {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function writeFileSync(path: string, data: string, encoding: 'utf8'): void;
}

declare module 'node:path' {
  const path: {
    join(...paths: string[]): string;
    relative(from: string, to: string): string;
  };

  export default path;
}

declare module 'node:url' {
  export function pathToFileURL(path: string): { href: string };
}

declare const process: {
  argv: string[];
  cwd(): string;
};

declare const console: {
  log(message?: unknown, ...optionalParams: unknown[]): void;
};

interface ImportMeta {
  url: string;
}
