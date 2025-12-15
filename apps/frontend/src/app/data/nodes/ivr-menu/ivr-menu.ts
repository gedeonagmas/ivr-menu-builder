import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, IvrMenuNodeSchema } from './schema';
import { uischema } from './uischema';
import { NodeType } from '@workflow-builder/types/node-types';

export const ivrMenuNode: PaletteItem<IvrMenuNodeSchema> = {
  label: 'node.ivrMenu.label',
  description: 'node.ivrMenu.description',
  type: 'ivr-menu',
  icon: 'ListBullets',
  templateType: NodeType.DecisionNode,
  defaultPropertiesData,
  schema,
  uischema,
};

