import { storyFrame } from './story-frame.js';

const meta = {
  title: 'Components/Typography'
};

export default meta;

export const Default = {
  render: () =>
    storyFrame('<prism-typography variant="body" size="medium">Body copy for Prism ui-core.</prism-typography>')
};

export const HeadlineLarge = {
  render: () =>
    storyFrame('<prism-typography as="h2" variant="headline" size="large">Section Heading</prism-typography>')
};

export const ThemeOnSurfaceOverride = {
  render: () =>
    storyFrame('<prism-typography variant="title" size="medium">Overridden text color</prism-typography>', {
      cssVariableOverride: '--prism-color-on-surface: #3b1366;'
    })
};
