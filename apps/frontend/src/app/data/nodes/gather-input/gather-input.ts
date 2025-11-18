import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, GatherInputNodeSchema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@workflow-builder/types/node-types';

export const gatherInputNode: PaletteItem<GatherInputNodeSchema> = {
  label: 'node.gatherInput.label',
  description: 'node.gatherInput.description',
  type: 'gather-input',
  icon: 'Keyboard',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};
