import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, IncomingCallNodeSchema } from './schema';
import { uischema } from './uischema';

export const incomingCallNode: PaletteItem<IncomingCallNodeSchema> = {
  label: 'node.incomingCall.label',
  description: 'node.incomingCall.description',
  type: 'incoming-call',
  icon: 'PhoneIncoming',
  defaultPropertiesData,
  schema,
  uischema,
};

