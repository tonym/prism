import { storyFrame } from './story-frame.js';

interface IconButtonStoryArgs {
  ariaLabel: string;
  disabled: boolean;
  icon: string;
  size: 'small' | 'medium' | 'large';
  variant: 'filled' | 'outlined' | 'tonal' | 'text';
}

function renderIconButton(args: IconButtonStoryArgs): string {
  const disabledAttribute = args.disabled ? ' disabled' : '';
  return storyFrame(
    `
<prism-icon-button aria-label="${args.ariaLabel}" size="${args.size}" variant="${args.variant}"${disabledAttribute}>
  <span slot="icon" aria-hidden="true">${args.icon}</span>
</prism-icon-button>
`.trim()
  );
}

const meta = {
  title: 'Components/IconButton',
  component: 'prism-icon-button',
  argTypes: {
    ariaLabel: { control: 'text' },
    icon: { control: 'text' },
    variant: { control: 'select', options: ['filled', 'outlined', 'tonal', 'text'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' }
  }
};

export default meta;

export const Default = {
  args: {
    ariaLabel: 'Close',
    icon: 'x',
    variant: 'filled',
    size: 'medium',
    disabled: false
  },
  render: renderIconButton
};

export const DisabledOutlined = {
  args: {
    ariaLabel: 'Notifications',
    icon: '!',
    variant: 'outlined',
    size: 'large',
    disabled: true
  },
  render: renderIconButton
};

export const ThemePrimaryOverride = {
  args: {
    ariaLabel: 'Favorite',
    icon: '*',
    variant: 'filled',
    size: 'medium',
    disabled: false
  },
  render: (args: IconButtonStoryArgs) => {
    const disabledAttribute = args.disabled ? ' disabled' : '';
    storyFrame(
      `
<prism-icon-button aria-label="${args.ariaLabel}" size="${args.size}" variant="${args.variant}"${disabledAttribute}>
  <span slot="icon" aria-hidden="true">${args.icon}</span>
</prism-icon-button>
`.trim(),
      {
        cssVariableOverride: '--prism-color-primary: #8e2c00;'
      }
    );
  }
};
