import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema } from '@workflow-builder/types/node-schema';

export const schema = {
  properties: {
    ...sharedProperties,
    reason: {
      type: 'string',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type HangUpCallNodeSchema = typeof schema;

