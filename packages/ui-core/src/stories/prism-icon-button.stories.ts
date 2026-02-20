import { storyFrame } from './story-frame.js';

const meta = {
  title: 'Components/IconButton'
};

export default meta;

export const Default = {
  render: () =>
    storyFrame(`
<prism-icon-button aria-label="Close">
  <span slot="icon" aria-hidden="true">x</span>
</prism-icon-button>
`.trim())
};

export const DisabledOutlined = {
  render: () =>
    storyFrame(`
<prism-icon-button aria-label="Notifications" disabled size="large" variant="outlined">
  <span slot="icon" aria-hidden="true">!</span>
</prism-icon-button>
`.trim())
};

export const ThemePrimaryOverride = {
  render: () =>
    storyFrame(
      `
<prism-icon-button aria-label="Favorite">
  <span slot="icon" aria-hidden="true">*</span>
</prism-icon-button>
`.trim(),
      {
        cssVariableOverride: '--prism-color-primary: #8e2c00;'
      }
    )
};
