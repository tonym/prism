import type { ComponentBlueprint } from '../component-blueprint.js';

export const iconButtonBlueprint = {
  componentId: 'icon-button',
  tagName: 'prism-icon-button',
  className: 'PrismIconButtonElement',
  templateKind: 'icon-button',
  description:
    'Theme-driven icon-only button primitive that requires an accessible name via aria-label or text alternative.',
  attributes: [
    {
      name: 'variant',
      type: 'enum',
      enumValues: ['filled', 'outlined', 'tonal', 'text'],
      defaultValue: 'filled',
      description: 'Visual treatment for the icon button control.'
    },
    {
      name: 'size',
      type: 'enum',
      enumValues: ['small', 'medium', 'large'],
      defaultValue: 'medium',
      description: 'Density and icon scale for the control.'
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
    },
    {
      name: 'aria-label',
      type: 'string',
      required: true,
      description: 'Accessible name required when no text alternative is provided.'
    }
  ],
  slots: [
    {
      name: 'icon',
      required: true,
      description: 'Visible icon glyph content.'
    },
    {
      name: 'default',
      description: 'Optional assistive text content for accessibility naming.'
    }
  ],
  parts: [
    {
      name: 'container',
      description: 'Layout wrapper for inline sizing and spacing.'
    },
    {
      name: 'control',
      description: 'Interactive native button element.'
    },
    {
      name: 'icon',
      description: 'Icon slot wrapper.'
    },
    {
      name: 'assistive',
      description: 'Visually hidden assistive text wrapper.'
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
      name: 'missing-aria-label',
      description: 'A11y warning state when no accessible name is present.'
    }
  ],
  variants: [
    {
      name: 'filled',
      attribute: 'variant',
      value: 'filled',
      description: 'Primary filled icon style.'
    },
    {
      name: 'outlined',
      attribute: 'variant',
      value: 'outlined',
      description: 'Outlined icon style with transparent background.'
    },
    {
      name: 'tonal',
      attribute: 'variant',
      value: 'tonal',
      description: 'Secondary container-based icon style.'
    },
    {
      name: 'text',
      attribute: 'variant',
      value: 'text',
      description: 'Text-only icon style for low-emphasis actions.'
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
      description: 'Foreground color for icon glyph contrast.'
    },
    {
      name: 'control-radius',
      target: 'control',
      cssProperty: 'border-radius',
      cssVariable: '--prism-shape-full',
      fallback: '9999px',
      description: 'Circular icon button radius from the shape scale.'
    },
    {
      name: 'icon-size',
      target: 'icon',
      cssProperty: 'font-size',
      cssVariable: '--prism-typography-title-medium-font-size',
      fallback: '1rem',
      description: 'Default icon size tied to theme typography scale.'
    }
  ],
  accessibility: [
    {
      kind: 'required-attribute',
      attribute: 'aria-label',
      condition: 'Required unless the default slot provides readable text content.',
      note: 'Icon-only controls must expose an accessible name.'
    }
  ]
} as const satisfies ComponentBlueprint;
