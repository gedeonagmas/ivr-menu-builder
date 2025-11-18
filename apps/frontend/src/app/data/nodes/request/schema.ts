import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const httpMethodOptions: Option[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
];

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
    url: {
      type: 'string',
    },
    method: {
      type: 'string',
      options: httpMethodOptions,
    },
    headers: {
      type: 'string',
    },
    body: {
      type: 'string',
    },
    decisionBranches,
    hasElse: {
      type: 'boolean',
    },
    hasFailure: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type RequestNodeSchema = typeof schema;

