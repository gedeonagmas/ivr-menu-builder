import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, ForwardToPhoneNodeSchema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@workflow-builder/types/node-types';

export const forwardToPhoneNode: PaletteItem<ForwardToPhoneNodeSchema> = {
  label: 'node.forwardToPhone.label',
  description: 'node.forwardToPhone.description',
  type: 'forward-to-phone',
  icon: 'ArrowRight',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};

