export interface StoryFrameOptions {
  cssVariableOverride?: string;
}

export function storyFrame(content: string, options: StoryFrameOptions = {}): string {
  const cssVariableOverride = options.cssVariableOverride
    ? ` ${options.cssVariableOverride}`
    : '';

  return `
<div style="
  align-items: center;
  background: var(--prism-color-surface-container-low, #f5f3fa);
  display: inline-flex;
  gap: 0.75rem;
  min-height: 6rem;
  padding: 1.5rem;
  ${cssVariableOverride}
">
  ${content}
</div>
`.trim();
}
