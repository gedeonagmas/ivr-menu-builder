import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, ConditionsNodeSchema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@workflow-builder/types/node-types';

export const conditionsNode: PaletteItem<ConditionsNodeSchema> = {
  label: 'node.conditions.label',
  description: 'node.conditions.description',
  type: 'conditions',
  icon: 'ListChecks',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};

