import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const transferTypeOptions: Option[] = [
  { label: 'Agent', value: 'agent' },
  { label: 'Queue', value: 'queue' },
  { label: 'Phone Number', value: 'phoneNumber' },
  { label: 'SIP URI', value: 'sip' },
];

export const transferMethodOptions: Option[] = [
  { label: 'Warm Transfer', value: 'warm' },
  { label: 'Cold Transfer', value: 'cold' },
  { label: 'Blind Transfer', value: 'blind' },
];

export const schema = {
  properties: {
    ...sharedProperties,
    transferType: {
      type: 'string',
      options: transferTypeOptions,
      placeholder: 'Select Transfer Type...',
    },
    agentId: {
      type: 'string',
    },
    queueId: {
      type: 'string',
    },
    phoneNumber: {
      type: 'string',
    },
    sipUri: {
      type: 'string',
    },
    transferMethod: {
      type: 'string',
      options: transferMethodOptions,
    },
    callerId: {
      type: 'string',
    },
    timeout: {
      type: 'number',
    },
    recordCall: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type TransferCallNodeSchema = typeof schema;

