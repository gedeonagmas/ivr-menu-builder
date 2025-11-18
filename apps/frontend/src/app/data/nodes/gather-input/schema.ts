import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const inputTypeOptions: Option[] = [
  { label: 'DTMF (Keypad)', value: 'dtmf' },
  { label: 'Speech Recognition', value: 'speech' },
  { label: 'Both', value: 'both' },
];

const menuOption = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    label: { type: 'string' },
    value: { type: 'string' },
  },
} as const;

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
    inputType: {
      type: 'string',
      options: inputTypeOptions,
      placeholder: 'Select Input Type...',
    },
    maxDigits: {
      type: 'number',
    },
    minDigits: {
      type: 'number',
    },
    timeout: {
      type: 'number',
    },
    finishOnKey: {
      type: 'string',
    },
    speechTimeout: {
      type: 'number',
    },
    language: {
      type: 'string',
    },
    variableName: {
      type: 'string',
    },
    menuOptions: {
      type: 'array',
      items: menuOption,
    },
    decisionBranches,
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type GatherInputNodeSchema = typeof schema;
