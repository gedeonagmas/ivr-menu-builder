import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { SendSMSNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<SendSMSNodeSchema> = {
  label: 'node.sendSMS.label',
  description: 'node.sendSMS.description',
  status: 'active',
  phoneNumber: '',
  message: '',
};

