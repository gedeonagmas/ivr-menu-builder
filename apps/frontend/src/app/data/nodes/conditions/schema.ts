import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema } from '@workflow-builder/types/node-schema';

const decisionBranches = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      conditions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            x: { type: 'string' },
            comparisonOperator: { type: 'string' },
            y: { type: 'string' },
            logicalOperator: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

export const schema = {
  properties: {
    ...sharedProperties,
    decisionBranches,
    hasElse: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type ConditionsNodeSchema = typeof schema;

