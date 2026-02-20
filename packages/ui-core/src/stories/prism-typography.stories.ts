import { storyFrame } from './story-frame.js';

interface TypographyStoryArgs {
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  size: 'small' | 'medium' | 'large';
  text: string;
  variant: 'display' | 'headline' | 'title' | 'body' | 'label';
}

function renderTypography(args: TypographyStoryArgs): string {
  return storyFrame(
    `<prism-typography as="${args.as}" size="${args.size}" variant="${args.variant}">${args.text}</prism-typography>`
  );
}

const meta = {
  title: 'Components/Typography',
  component: 'prism-typography',
  argTypes: {
    text: { control: 'text' },
    variant: { control: 'select', options: ['display', 'headline', 'title', 'body', 'label'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    as: { control: 'select', options: ['span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'] }
  }
};

export default meta;

export const Default = {
  args: {
    text: 'Body copy for Prism ui-core.',
    variant: 'body',
    size: 'medium',
    as: 'span'
  },
  render: renderTypography
};

export const HeadlineLarge = {
  args: {
    text: 'Section Heading',
    variant: 'headline',
    size: 'large',
    as: 'h2'
  },
  render: renderTypography
};

export const ThemeOnSurfaceOverride = {
  args: {
    text: 'Overridden text color',
    variant: 'title',
    size: 'medium',
    as: 'span'
  },
  render: (args: TypographyStoryArgs) =>
    storyFrame(`<prism-typography as="${args.as}" size="${args.size}" variant="${args.variant}">${args.text}</prism-typography>`, {
      cssVariableOverride: '--prism-color-on-surface: #3b1366;'
    })
};
