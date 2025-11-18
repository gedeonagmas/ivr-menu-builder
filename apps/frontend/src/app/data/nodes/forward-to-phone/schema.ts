import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema } from '@workflow-builder/types/node-schema';

const forwardConnectors = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      label: { type: 'string' },
    },
  },
} as const;

export const schema = {
  properties: {
    ...sharedProperties,
    phoneNumber: {
      type: 'string',
    },
    callerId: {
      type: 'string',
    },
    timeout: {
      type: 'number',
    },
    forwardConnectors,
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type ForwardToPhoneNodeSchema = typeof schema;

