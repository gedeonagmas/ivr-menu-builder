import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, ExecuteSWMLNodeSchema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@workflow-builder/types/node-types';

export const executeSWMLNode: PaletteItem<ExecuteSWMLNodeSchema> = {
  label: 'node.executeSWML.label',
  description: 'node.executeSWML.description',
  type: 'execute-swml',
  icon: 'Code',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};

