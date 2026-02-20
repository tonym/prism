import { storyFrame } from './story-frame.js';

interface ButtonStoryArgs {
  disabled: boolean;
  label: string;
  size: 'small' | 'medium' | 'large';
  type: 'button' | 'submit' | 'reset';
  variant: 'filled' | 'outlined' | 'tonal' | 'text';
}

function renderButton(args: ButtonStoryArgs): string {
  const disabledAttribute = args.disabled ? ' disabled' : '';
  return storyFrame(
    `<prism-button size="${args.size}" type="${args.type}" variant="${args.variant}"${disabledAttribute}>${args.label}</prism-button>`
  );
}

const meta = {
  title: 'Components/Button',
  component: 'prism-button',
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['filled', 'outlined', 'tonal', 'text'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    disabled: { control: 'boolean' }
  }
};

export default meta;

export const Default = {
  args: {
    label: 'Continue',
    variant: 'filled',
    size: 'medium',
    type: 'button',
    disabled: false
  },
  render: renderButton
};

export const Outlined = {
  args: {
    label: 'Secondary Action',
    variant: 'outlined',
    size: 'medium',
    type: 'button',
    disabled: false
  },
  render: renderButton
};

export const ThemePrimaryOverride = {
  args: {
    label: 'Brand Override',
    variant: 'filled',
    size: 'medium',
    type: 'button',
    disabled: false
  },
  render: (args: ButtonStoryArgs) => {
    const disabledAttribute = args.disabled ? ' disabled' : '';
    storyFrame(
      `<prism-button size="${args.size}" type="${args.type}" variant="${args.variant}"${disabledAttribute}>${args.label}</prism-button>`,
      {
        cssVariableOverride: '--prism-color-primary: #006d3d;'
      }
    );
  }
};
