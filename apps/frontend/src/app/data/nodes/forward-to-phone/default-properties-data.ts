import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { ForwardToPhoneNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<ForwardToPhoneNodeSchema> = {
  label: 'node.forwardToPhone.label',
  description: 'node.forwardToPhone.description',
  status: 'active',
  phoneNumber: '',
  callerId: '',
  timeout: 30,
  forwardConnectors: [
    { type: 'success', label: 'Success' },
    { type: 'noAnswer', label: 'No Answer' },
    { type: 'busy', label: 'Busy' },
    { type: 'decline', label: 'Decline' },
    { type: 'error', label: 'Error' },
  ],
};

