import { storyFrame } from './story-frame.js';

interface SurfaceStoryArgs {
  body: string;
  elevation: 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
  footer: string;
  header: string;
  interactive: boolean;
  tone: 'default' | 'container-low' | 'container-high' | 'inverse';
}

function renderSurface(args: SurfaceStoryArgs): string {
  const interactiveAttribute = args.interactive ? ' interactive' : '';
  const footerSlot = args.footer.length > 0 ? `<span slot="footer">${args.footer}</span>` : '';
  return storyFrame(
    `
<prism-surface tone="${args.tone}" elevation="${args.elevation}"${interactiveAttribute}>
  <span slot="header">${args.header}</span>
  ${args.body}
  ${footerSlot}
</prism-surface>
`.trim()
  );
}

const meta = {
  title: 'Components/Surface',
  component: 'prism-surface',
  argTypes: {
    header: { control: 'text' },
    body: { control: 'text' },
    footer: { control: 'text' },
    tone: { control: 'select', options: ['default', 'container-low', 'container-high', 'inverse'] },
    elevation: { control: 'select', options: ['level0', 'level1', 'level2', 'level3', 'level4', 'level5'] },
    interactive: { control: 'boolean' }
  }
};

export default meta;

export const Default = {
  args: {
    header: 'Default Surface',
    body: 'This is a neutral card container.',
    footer: '',
    tone: 'default',
    elevation: 'level1',
    interactive: false
  },
  render: renderSurface
};

export const InverseElevated = {
  args: {
    header: 'Interactive Surface',
    body: 'Move your pointer over this card to inspect hover elevation behavior.',
    footer: 'Footer slot',
    tone: 'inverse',
    elevation: 'level3',
    interactive: true
  },
  render: renderSurface
};

export const ThemeContainerHighOverride = {
  args: {
    header: 'Container High Override',
    body: 'The background tone comes from a single custom property override.',
    footer: '',
    tone: 'container-high',
    elevation: 'level1',
    interactive: false
  },
  render: (args: SurfaceStoryArgs) => {
    const interactiveAttribute = args.interactive ? ' interactive' : '';
    const footerSlot = args.footer.length > 0 ? `<span slot="footer">${args.footer}</span>` : '';
    storyFrame(
      `
<prism-surface tone="${args.tone}" elevation="${args.elevation}"${interactiveAttribute}>
  <span slot="header">${args.header}</span>
  ${args.body}
  ${footerSlot}
</prism-surface>
`.trim(),
      {
        cssVariableOverride: '--prism-color-surface-container-high: #d9f6ea;'
      }
    );
  }
};
