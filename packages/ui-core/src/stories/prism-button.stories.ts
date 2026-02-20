import { storyFrame } from './story-frame.js';

const meta = {
  title: 'Components/Button'
};

export default meta;

export const Default = {
  render: () => storyFrame('<prism-button>Continue</prism-button>')
};

export const Outlined = {
  render: () => storyFrame('<prism-button variant="outlined">Secondary Action</prism-button>')
};

export const ThemePrimaryOverride = {
  render: () =>
    storyFrame('<prism-button>Brand Override</prism-button>', {
      cssVariableOverride: '--prism-color-primary: #006d3d;'
    })
};
