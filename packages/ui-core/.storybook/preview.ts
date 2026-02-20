import type { Preview } from '@storybook/web-components-vite';
import '@prism/ui-core/generated/theme/base.css';
import '@prism/ui-core/generated/fonts/base.css';
import { registerGeneratedPrismComponents } from '@prism/ui-core/generated/components';

registerGeneratedPrismComponents();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    a11y: {
      context: 'body'
    }
  }
};

export default preview;
