import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, RequestNodeSchema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@workflow-builder/types/node-types';

export const requestNode: PaletteItem<RequestNodeSchema> = {
  label: 'node.request.label',
  description: 'node.request.description',
  type: 'request',
  icon: 'WebhooksLogo',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};

