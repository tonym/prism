import type { ComponentBlueprint } from '../component-blueprint.js';

export const buttonBlueprint = {
  componentId: 'button',
  tagName: 'prism-button',
  className: 'PrismButtonElement',
  templateKind: 'button',
  description: 'Theme-driven action button primitive with slots for leading and trailing affordances.',
  attributes: [
    {
      name: 'variant',
      type: 'enum',
      enumValues: ['filled', 'outlined', 'tonal', 'text'],
      defaultValue: 'filled',
      description: 'Visual treatment for the button control.'
    },
    {
      name: 'size',
      type: 'enum',
      enumValues: ['small', 'medium', 'large'],
      defaultValue: 'medium',
      description: 'Density and typography size for the control.'
    },
    {
      name: 'type',
      type: 'enum',
      enumValues: ['button', 'submit', 'reset'],
      defaultValue: 'button',
      description: 'Native button type forwarded to the control.'
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
      description: 'Disables interaction and reflects native disabled semantics.'
    }
  ],
  slots: [
    {
      name: 'default',
      required: true,
      description: 'Primary label content for the button.'
    },
    {
      name: 'leading',
      description: 'Optional leading icon or affordance.'
    },
    {
      name: 'trailing',
      description: 'Optional trailing icon or affordance.'
    }
  ],
  parts: [
    {
      name: 'container',
      description: 'Layout wrapper for spacing and inline sizing.'
    },
    {
      name: 'control',
      description: 'Interactive native button element.'
    },
    {
      name: 'label',
      description: 'Label wrapper around the default slot.'
    },
    {
      name: 'leading-icon',
      description: 'Slot part for leading icon content.'
    },
    {
      name: 'trailing-icon',
      description: 'Slot part for trailing icon content.'
    }
  ],
  states: [
    {
      name: 'enabled',
      description: 'Default interactive state.'
    },
    {
      name: 'disabled',
      description: 'Non-interactive state when disabled is present.'
    },
    {
      name: 'focus-visible',
      description: 'Focus ring when keyboard focus is visible.'
    }
  ],
  variants: [
    {
      name: 'filled',
      attribute: 'variant',
      value: 'filled',
      description: 'Primary filled action style.'
    },
    {
      name: 'outlined',
      attribute: 'variant',
      value: 'outlined',
      description: 'Outlined action style with transparent background.'
    },
    {
      name: 'tonal',
      attribute: 'variant',
      value: 'tonal',
      description: 'Secondary container-based action style.'
    },
    {
      name: 'text',
      attribute: 'variant',
      value: 'text',
      description: 'Text-only style for low-emphasis actions.'
    }
  ],
  styleHooks: [
    {
      name: 'control-background',
      target: 'control',
      cssProperty: 'background-color',
      cssVariable: '--prism-color-primary',
      fallback: '#0057d9',
      description: 'Background color for the filled variant.'
    },
    {
      name: 'control-color',
      target: 'control',
      cssProperty: 'color',
      cssVariable: '--prism-color-on-primary',
      fallback: '#ffffff',
      description: 'Foreground color for readable action text.'
    },
    {
      name: 'control-radius',
      target: 'control',
      cssProperty: 'border-radius',
      cssVariable: '--prism-shape-full',
      fallback: '9999px',
      description: 'Button corner radius from the shape scale.'
    },
    {
      name: 'label-font-family',
      target: 'text',
      cssProperty: 'font-family',
      cssVariable: '--prism-typography-label-large-font-family',
      fallback: 'sans-serif',
      description: 'Default label typography family.'
    },
    {
      name: 'label-font-size',
      target: 'text',
      cssProperty: 'font-size',
      cssVariable: '--prism-typography-label-large-font-size',
      fallback: '0.875rem',
      description: 'Default label typography size.'
    },
    {
      name: 'label-font-weight',
      target: 'text',
      cssProperty: 'font-weight',
      cssVariable: '--prism-typography-label-large-font-weight',
      fallback: '500',
      description: 'Default label typography weight.'
    },
    {
      name: 'label-letter-spacing',
      target: 'text',
      cssProperty: 'letter-spacing',
      cssVariable: '--prism-typography-label-large-letter-spacing',
      fallback: '0.00625rem',
      description: 'Default label typography letter spacing.'
    },
    {
      name: 'label-line-height',
      target: 'text',
      cssProperty: 'line-height',
      cssVariable: '--prism-typography-label-large-line-height',
      fallback: '1.25rem',
      description: 'Default label typography line height.'
    }
  ],
  accessibility: [
    {
      kind: 'advisory',
      note: 'Uses a native button element to preserve keyboard and screen-reader behavior.'
    }
  ]
} as const satisfies ComponentBlueprint;
