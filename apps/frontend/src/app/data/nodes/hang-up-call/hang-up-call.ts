import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, HangUpCallNodeSchema } from './schema';
import { uischema } from './uischema';

export const hangUpCallNode: PaletteItem<HangUpCallNodeSchema> = {
  label: 'node.hangUpCall.label',
  description: 'node.hangUpCall.description',
  type: 'hang-up-call',
  icon: 'PhoneX',
  defaultPropertiesData,
  schema,
  uischema,
};

