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

interface ComponentStatusBase {
  componentId: string;
  blueprintRef: string;
  artifactRef: string;
  blueprintHash: string;
  artifactHash: string;
  generatorRef: string;
  generatorHash: string;
  version: ComponentVersion;
  accessibility: ComponentAccessibility;
  statusFlags?: string[];
}

type ComponentStatusRegenerationState =
  | {
      mayRegenerate: true;
      regenerationAdvisory: ComponentRegenerationAdvisory;
    }
  | {
      mayRegenerate: false;
      regenerationAdvisory?: never;
    };

export type ComponentStatus = ComponentStatusBase & ComponentStatusRegenerationState;

interface ComponentStatusRegistryEntryBase {
  componentId: string;
  blueprintRef: string;
  artifactRef: string;
  generatorRef: string;
  generatorIdentityInput?: string;
  version?: ComponentVersion;
  accessibility?: ComponentAccessibility;
  statusFlags?: string[];
}

type ComponentStatusRegistryRegenerationState =
  | {
      mayRegenerate: true;
      regenerationAdvisory: ComponentRegenerationAdvisory;
    }
  | {
      mayRegenerate?: false;
      regenerationAdvisory?: never;
    };

export type ComponentStatusRegistryEntry =
  ComponentStatusRegistryEntryBase & ComponentStatusRegistryRegenerationState;

export interface ComponentStatusRefResolver {
  read(ref: string): string | undefined;
}
