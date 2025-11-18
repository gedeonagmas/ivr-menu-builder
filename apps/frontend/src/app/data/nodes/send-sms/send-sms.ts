import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, SendSMSNodeSchema } from './schema';
import { uischema } from './uischema';

export const sendSMSNode: PaletteItem<SendSMSNodeSchema> = {
  label: 'node.sendSMS.label',
  description: 'node.sendSMS.description',
  type: 'send-sms',
  icon: 'ChatText',
  defaultPropertiesData,
  schema,
  uischema,
};

