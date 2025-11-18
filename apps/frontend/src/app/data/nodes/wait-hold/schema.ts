import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const waitTypeOptions: Option[] = [
  { label: 'Wait (Silent)', value: 'wait' },
  { label: 'Hold with Music', value: 'hold' },
  { label: 'Hold with Message', value: 'holdMessage' },
];

export const schema = {
  properties: {
    ...sharedProperties,
    waitType: {
      type: 'string',
      options: waitTypeOptions,
      placeholder: 'Select Wait Type...',
    },
    duration: {
      type: 'number',
    },
    holdMusic: {
      type: 'string',
    },
    holdMessage: {
      type: 'string',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type WaitHoldNodeSchema = typeof schema;

