import { createToolHandlersV1 } from '../tools.js';
import { UiCoreArtifactStore } from '../artifact-store.js';
import type { ToolResult } from '../types.js';

interface TextArtifactPayload {
  artifact: {
    content: string;
  };
}

function requireSuccess(result: ToolResult, toolName: string): unknown {
  if (!result.ok) {
    throw new Error(`${toolName} failed: ${result.error.code} - ${result.error.message}`);
  }

  return result.data;
}

function asTextArtifactPayload(value: unknown, toolName: string): TextArtifactPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${toolName} returned an unexpected payload shape.`);
  }

  const payload = value as Record<string, unknown>;
  const artifact = payload.artifact;

  if (typeof artifact !== 'object' || artifact === null || Array.isArray(artifact)) {
    throw new Error(`${toolName} returned payload without an artifact object.`);
  }

  const artifactObject = artifact as Record<string, unknown>;

  if (typeof artifactObject.content !== 'string') {
    throw new Error(`${toolName} returned an artifact without string content.`);
  }

  return {
    artifact: {
      content: artifactObject.content
    }
  };
}

function main(): void {
  const store = new UiCoreArtifactStore(process.cwd());
  const tools = createToolHandlersV1(store);
  const getBaseThemeTool = tools.getBaseTheme;
  const getComponentArtifactTool = tools.getComponentArtifact;

  if (!getBaseThemeTool || !getComponentArtifactTool) {
    throw new Error('Expected MCP tools are missing from the locked v1 surface.');
  }

  const baseTheme = asTextArtifactPayload(
    requireSuccess(getBaseThemeTool(undefined), 'getBaseTheme'),
    'getBaseTheme'
  );
  const buttonArtifact = asTextArtifactPayload(
    requireSuccess(getComponentArtifactTool({ componentId: 'button' }), 'getComponentArtifact'),
    'getComponentArtifact'
  );

  const html = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width,initial-scale=1">',
    '  <title>Prism UI Core MCP Consumer Override Example</title>',
    '  <style>',
    String(baseTheme.artifact.content),
    '  </style>',
    '  <style>',
    '    :root {',
    '      --prism-color-primary: #14532d;',
    '      --prism-color-on-primary: #f8fafc;',
    '    }',
    '    body {',
    '      font-family: var(--prism-font-family-sans, "Segoe UI", sans-serif);',
    '      margin: 2rem;',
    '    }',
    '  </style>',
    '</head>',
    '<body>',
    '  <prism-button variant="filled" size="medium">Consumer Override Demo</prism-button>',
    '  <script type="module">',
    String(buttonArtifact.artifact.content),
    '  </script>',
    '</body>',
    '</html>'
  ].join('\n');

  process.stdout.write(html);
}

main();
