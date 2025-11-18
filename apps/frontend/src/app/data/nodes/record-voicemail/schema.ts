import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const finishOnKeyOptions: Option[] = [
  { label: '# (Hash)', value: '#' },
  { label: '* (Asterisk)', value: '*' },
  { label: 'Any Key', value: 'any' },
  { label: 'None', value: 'none' },
];

export const schema = {
  properties: {
    ...sharedProperties,
    maxDuration: {
      type: 'number',
    },
    timeout: {
      type: 'number',
    },
    finishOnKey: {
      type: 'string',
      options: finishOnKeyOptions,
    },
    playBeep: {
      type: 'boolean',
    },
    transcription: {
      type: 'boolean',
    },
    emailNotification: {
      type: 'boolean',
    },
    emailAddress: {
      type: 'string',
    },
    storageLocation: {
      type: 'string',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type RecordVoicemailNodeSchema = typeof schema;

