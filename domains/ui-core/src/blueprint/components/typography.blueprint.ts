import type { ComponentBlueprint, ComponentBlueprintVariant } from '../component-blueprint.js';
import { prismTypographySizes, prismTypographyVariants } from '../typography-options.js';

const typographyVariants: ComponentBlueprintVariant[] = prismTypographyVariants.map((variant) => ({
  name: variant,
  attribute: 'variant',
  value: variant,
  description: `Typography variant sourced from the Prism theme contract (${variant}).`
}));

export const typographyBlueprint = {
  componentId: 'typography',
  tagName: 'prism-typography',
  className: 'PrismTypographyElement',
  templateKind: 'typography',
  description:
    'Theme-driven typography primitive where variant and size options are constrained by Prism theme typing.',
  attributes: [
    {
      name: 'variant',
      type: 'enum',
      enumValues: prismTypographyVariants,
      defaultValue: 'body',
      description: 'Typography variant constrained to keys from PrismTheme.typography.'
    },
    {
      name: 'size',
      type: 'enum',
      enumValues: prismTypographySizes,
      defaultValue: 'medium',
      description: 'Typography size constrained to keys from PrismTheme typography scales.'
    },
    {
      name: 'as',
      type: 'enum',
      enumValues: ['span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'],
      defaultValue: 'span',
      description: 'Optional semantic tag rendered inside the primitive host.'
    }
  ],
  slots: [
    {
      name: 'default',
      required: true,
      description: 'Text content rendered with theme-bound typography styles.'
    }
  ],
  parts: [
    {
      name: 'text',
      description: 'Inner text wrapper receiving typography styles.'
    }
  ],
  states: [
    {
      name: 'rendered',
      description: 'Default rendered state.'
    }
  ],
  variants: typographyVariants,
  styleHooks: [
    {
      name: 'text-color',
      target: 'text',
      cssProperty: 'color',
      cssVariable: '--prism-color-on-surface',
      fallback: '#1a1b1f',
      description: 'Default text color from the theme surface foreground role.'
    }
  ],
  accessibility: [
    {
      kind: 'advisory',
      note: 'Use the as attribute to provide appropriate semantic heading and label structure.'
    }
  ]
} as const satisfies ComponentBlueprint;
