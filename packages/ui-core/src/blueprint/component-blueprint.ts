export type ComponentTemplateKind =
  | 'button'
  | 'icon-button'
  | 'typography'
  | 'surface';

export type ComponentAttributeType = 'string' | 'boolean' | 'enum';

export interface ComponentBlueprintAttribute {
  name: string;
  type: ComponentAttributeType;
  enumValues?: readonly string[];
  defaultValue?: string | boolean;
  required?: boolean;
  description: string;
}

export interface ComponentBlueprintSlot {
  name: string;
  required?: boolean;
  description: string;
}

export interface ComponentBlueprintPart {
  name: string;
  description: string;
}

export interface ComponentBlueprintState {
  name: string;
  description: string;
}

export interface ComponentBlueprintVariant {
  name: string;
  attribute: string;
  value: string;
  description: string;
}

export type ComponentStyleTarget =
  | 'host'
  | 'container'
  | 'control'
  | 'text'
  | 'icon'
  | 'header'
  | 'body'
  | 'footer';

export interface ComponentBlueprintStyleHook {
  name: string;
  target: ComponentStyleTarget;
  cssProperty: string;
  cssVariable: string;
  fallback?: string;
  description: string;
}

export interface ComponentBlueprintAccessibilityFact {
  kind: 'required-attribute' | 'advisory';
  note: string;
  attribute?: string;
  condition?: string;
}

export interface ComponentBlueprint {
  componentId: string;
  tagName: `prism-${string}`;
  className: string;
  templateKind: ComponentTemplateKind;
  description: string;
  attributes: readonly ComponentBlueprintAttribute[];
  slots: readonly ComponentBlueprintSlot[];
  parts: readonly ComponentBlueprintPart[];
  states: readonly ComponentBlueprintState[];
  variants: readonly ComponentBlueprintVariant[];
  styleHooks: readonly ComponentBlueprintStyleHook[];
  accessibility: readonly ComponentBlueprintAccessibilityFact[];
}
