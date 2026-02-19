import { componentBlueprints } from '../blueprint/components/index.js';
import { artifactFileNameForBlueprint, GENERATED_COMPONENT_DIRECTORY } from './generate-components.js';

export const componentBlueprintDirectoryRef = 'src/blueprint/components';
export const componentGeneratorRef = 'src/generator/generate-components.ts';

export function blueprintRefForComponent(componentId: string): string {
  const blueprint = componentBlueprints.find((entry) => entry.componentId === componentId);

  if (!blueprint) {
    throw new Error(`Unknown component blueprint id: ${componentId}.`);
  }

  return `${componentBlueprintDirectoryRef}/${componentId}.blueprint.ts`;
}

export function artifactRefForComponent(componentId: string): string {
  const blueprint = componentBlueprints.find((entry) => entry.componentId === componentId);

  if (!blueprint) {
    throw new Error(`Unknown component blueprint id: ${componentId}.`);
  }

  return `${GENERATED_COMPONENT_DIRECTORY}/${artifactFileNameForBlueprint(blueprint)}`;
}
