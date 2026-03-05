import os from 'node:os';
import path from 'node:path';

import { readText } from './file-io.js';

function parseQuotedValue(rawValue) {
  const value = rawValue.trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function parseArrayOfStrings(rawValue) {
  const matches = [...rawValue.matchAll(/(['"])(.*?)\1/g)];
  return matches.map((match) => match[2] ?? '').filter((entry) => entry.length > 0);
}

function parseInlineEnvTable(rawValue) {
  const env = {};

  for (const match of rawValue.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(['"])(.*?)\2/g)) {
    const key = match[1];
    const value = match[3] ?? '';

    if (key) {
      env[key] = value;
    }
  }

  return env;
}

function getDefaultConfigPath() {
  return path.resolve(os.homedir(), '.codex/config.toml');
}

export async function readMcpServerConfig(options = {}) {
  const configPath = options.configPath ?? process.env.PRISM_CODEX_CONFIG_PATH ?? getDefaultConfigPath();
  const serverName = options.serverName ?? process.env.PRISM_FIGMA_MCP_SERVER ?? 'figma_console';
  const source = await readText(configPath);

  const sectionPattern = new RegExp(`^\\[mcp_servers\\.${serverName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\]$`, 'm');
  const sectionMatch = sectionPattern.exec(source);

  if (!sectionMatch || sectionMatch.index < 0) {
    throw new Error(`MCP server \"${serverName}\" was not found in ${configPath}.`);
  }

  const sectionStart = sectionMatch.index + sectionMatch[0].length;
  const nextSectionIndex = source.slice(sectionStart).search(/^\[/m);
  const sectionBody =
    nextSectionIndex < 0
      ? source.slice(sectionStart)
      : source.slice(sectionStart, sectionStart + nextSectionIndex);

  const commandMatch = sectionBody.match(/^\s*command\s*=\s*(.+)$/m);
  const argsMatch = sectionBody.match(/^\s*args\s*=\s*(\[[\s\S]*?\])\s*$/m);
  const envMatch = sectionBody.match(/^\s*env\s*=\s*(\{[\s\S]*?\})\s*$/m);

  if (!commandMatch) {
    throw new Error(`MCP server \"${serverName}\" does not have a command in ${configPath}.`);
  }

  const command = parseQuotedValue(commandMatch[1] ?? '');
  const args = argsMatch ? parseArrayOfStrings(argsMatch[1] ?? '[]') : [];
  const env = envMatch ? parseInlineEnvTable(envMatch[1] ?? '{}') : {};

  if (command.length === 0) {
    throw new Error(`MCP server \"${serverName}\" has an empty command in ${configPath}.`);
  }

  return {
    configPath,
    serverName,
    command,
    args,
    env
  };
}
