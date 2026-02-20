import { storyFrame } from './story-frame.js';

const meta = {
  title: 'Components/Surface'
};

export default meta;

export const Default = {
  render: () =>
    storyFrame(
      `
<prism-surface>
  <span slot="header">Default Surface</span>
  This is a neutral card container.
</prism-surface>
`.trim()
    )
};

export const InverseElevated = {
  render: () =>
    storyFrame(
      `
<prism-surface tone="inverse" elevation="level3" interactive>
  <span slot="header">Interactive Surface</span>
  Move your pointer over this card to inspect hover elevation behavior.
  <span slot="footer">Footer slot</span>
</prism-surface>
`.trim()
    )
};

export const ThemeContainerHighOverride = {
  render: () =>
    storyFrame(
      `
<prism-surface tone="container-high">
  <span slot="header">Container High Override</span>
  The background tone comes from a single custom property override.
</prism-surface>
`.trim(),
      {
        cssVariableOverride: '--prism-color-surface-container-high: #d9f6ea;'
      }
    )
};
