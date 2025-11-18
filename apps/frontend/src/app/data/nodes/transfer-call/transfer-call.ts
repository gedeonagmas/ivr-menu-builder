import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, TransferCallNodeSchema } from './schema';
import { uischema } from './uischema';

export const transferCallNode: PaletteItem<TransferCallNodeSchema> = {
  label: 'node.transferCall.label',
  description: 'node.transferCall.description',
  type: 'transfer-call',
  icon: 'PhoneTransfer',
  defaultPropertiesData,
  schema,
  uischema,
};

