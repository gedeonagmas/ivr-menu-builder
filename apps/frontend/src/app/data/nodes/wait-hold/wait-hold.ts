import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, WaitHoldNodeSchema } from './schema';
import { uischema } from './uischema';

export const waitHoldNode: PaletteItem<WaitHoldNodeSchema> = {
  label: 'node.waitHold.label',
  description: 'node.waitHold.description',
  type: 'wait-hold',
  icon: 'Clock',
  defaultPropertiesData,
  schema,
  uischema,
};

