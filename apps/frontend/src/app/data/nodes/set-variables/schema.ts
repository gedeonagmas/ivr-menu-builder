import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema } from '@workflow-builder/types/node-schema';

const variable = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    value: { type: 'string' },
  },
} as const;

export const schema = {
  properties: {
    ...sharedProperties,
    variables: {
      type: 'array',
      items: variable,
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type SetVariablesNodeSchema = typeof schema;

