import type { ComponentBlueprint } from '../component-blueprint.js';

export const surfaceBlueprint = {
  componentId: 'surface',
  tagName: 'prism-surface',
  className: 'PrismSurfaceElement',
  templateKind: 'surface',
  description: 'Theme-driven card/surface primitive with stable header/body/footer slots and parts.',
  attributes: [
    {
      name: 'tone',
      type: 'enum',
      enumValues: ['default', 'container-low', 'container-high', 'inverse'],
      defaultValue: 'default',
      description: 'Surface color treatment using Prism surface color roles.'
    },
    {
      name: 'elevation',
      type: 'enum',
      enumValues: ['level0', 'level1', 'level2', 'level3', 'level4', 'level5'],
      defaultValue: 'level1',
      description: 'Elevation step from the Prism elevation scale.'
    },
    {
      name: 'interactive',
      type: 'boolean',
      defaultValue: false,
      description: 'Adds hover/focus affordances for interactive surfaces.'
    }
  ],
  slots: [
    {
      name: 'header',
      description: 'Optional header content region.'
    },
    {
      name: 'default',
      required: true,
      description: 'Primary surface body content.'
    },
    {
      name: 'footer',
      description: 'Optional footer content region.'
    }
  ],
  parts: [
    {
      name: 'container',
      description: 'Surface wrapper with tone and elevation styles.'
    },
    {
      name: 'header',
      description: 'Header content region.'
    },
    {
      name: 'body',
      description: 'Body content region.'
    },
    {
      name: 'footer',
      description: 'Footer content region.'
    }
  ],
  states: [
    {
      name: 'resting',
      description: 'Default surface state.'
    },
    {
      name: 'interactive',
      description: 'Interactive style state when interactive is present.'
    }
  ],
  variants: [
    {
      name: 'default',
      attribute: 'tone',
      value: 'default',
      description: 'Base surface tone using color.surface.'
    },
    {
      name: 'container-low',
      attribute: 'tone',
      value: 'container-low',
      description: 'Low-emphasis container tone.'
    },
    {
      name: 'container-high',
      attribute: 'tone',
      value: 'container-high',
      description: 'High-emphasis container tone.'
    },
    {
      name: 'inverse',
      attribute: 'tone',
      value: 'inverse',
      description: 'Inverse surface tone for contrast sections.'
    }
  ],
  styleHooks: [
    {
      name: 'surface-background',
      target: 'container',
      cssProperty: 'background-color',
      cssVariable: '--prism-color-surface',
      fallback: '#fbf8ff',
      description: 'Base surface background color.'
    },
    {
      name: 'surface-foreground',
      target: 'container',
      cssProperty: 'color',
      cssVariable: '--prism-color-on-surface',
      fallback: '#1a1b1f',
      description: 'Base foreground color for readable content.'
    },
    {
      name: 'surface-radius',
      target: 'container',
      cssProperty: 'border-radius',
      cssVariable: '--prism-shape-large',
      fallback: '16px',
      description: 'Card corner radius from the shape scale.'
    },
    {
      name: 'surface-elevation-factor',
      target: 'container',
      cssProperty: '--prism-surface-elevation-factor',
      cssVariable: '--prism-elevation-level1',
      fallback: '1',
      description: 'Elevation scalar used to derive surface shadow strength.'
    },
    {
      name: 'header-font',
      target: 'header',
      cssProperty: 'font-family',
      cssVariable: '--prism-typography-title-medium-font-family',
      fallback: 'sans-serif',
      description: 'Header typography family.'
    },
    {
      name: 'header-size',
      target: 'header',
      cssProperty: 'font-size',
      cssVariable: '--prism-typography-title-medium-font-size',
      fallback: '1rem',
      description: 'Header typography size.'
    },
    {
      name: 'body-font',
      target: 'body',
      cssProperty: 'font-family',
      cssVariable: '--prism-typography-body-medium-font-family',
      fallback: 'sans-serif',
      description: 'Body typography family.'
    },
    {
      name: 'body-size',
      target: 'body',
      cssProperty: 'font-size',
      cssVariable: '--prism-typography-body-medium-font-size',
      fallback: '0.875rem',
      description: 'Body typography size.'
    }
  ],
  accessibility: [
    {
      kind: 'advisory',
      note: 'Use semantic heading content in the header slot when surface content needs section structure.'
    }
  ]
} as const satisfies ComponentBlueprint;
