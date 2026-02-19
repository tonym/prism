export type ComponentVersion = 'dev' | 'beta' | 'prod';

export interface ComponentAccessibility {
  conformance: 'unknown' | 'partial' | 'pass';
  notes?: string[];
  lastEvaluatedRef?: string;
}

export interface ComponentRegenerationAdvisory {
  level: 'info' | 'caution' | 'warning';
  notes: string[];
}

export interface ComponentStatus {
  componentId: string;
  blueprintRef: string;
  artifactRef: string;
  blueprintHash: string;
  artifactHash: string;
  generatorRef: string;
  generatorHash: string;
  version: ComponentVersion;
  accessibility: ComponentAccessibility;
  mayRegenerate: boolean;
  regenerationAdvisory?: ComponentRegenerationAdvisory;
  statusFlags?: string[];
}

export interface ComponentStatusRegistryEntry {
  componentId: string;
  blueprintRef: string;
  artifactRef: string;
  generatorRef: string;
  generatorIdentityInput?: string;
  version?: ComponentVersion;
  accessibility?: ComponentAccessibility;
  mayRegenerate?: boolean;
  regenerationAdvisory?: ComponentRegenerationAdvisory;
  statusFlags?: string[];
}

export interface ComponentStatusRefResolver {
  read(ref: string): string | undefined;
}
