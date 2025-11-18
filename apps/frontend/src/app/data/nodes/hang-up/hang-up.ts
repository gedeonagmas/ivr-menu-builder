import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, HangUpNodeSchema } from './schema';
import { uischema } from './uischema';

export const hangUpNode: PaletteItem<HangUpNodeSchema> = {
  label: 'node.hangUp.label',
  description: 'node.hangUp.description',
  type: 'hang-up',
  icon: 'PhoneX',
  defaultPropertiesData,
  schema,
  uischema,
};

