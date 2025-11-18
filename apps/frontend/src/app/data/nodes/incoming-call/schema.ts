import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const callSourceOptions: Option[] = [
  { label: 'Any Number', value: 'any' },
  { label: 'Specific Number', value: 'specific' },
  { label: 'Number Pattern', value: 'pattern' },
  { label: 'Contact List', value: 'contactList' },
];

export const timeOfDayOptions: Option[] = [
  { label: 'Any Time', value: 'any' },
  { label: 'Business Hours', value: 'businessHours' },
  { label: 'After Hours', value: 'afterHours' },
  { label: 'Custom Hours', value: 'custom' },
];

export const schema = {
  properties: {
    ...sharedProperties,
    callSource: {
      type: 'string',
      options: callSourceOptions,
      placeholder: 'Select Call Source...',
    },
    phoneNumber: {
      type: 'string',
    },
    numberPattern: {
      type: 'string',
    },
    contactList: {
      type: 'string',
    },
    timeOfDay: {
      type: 'string',
      options: timeOfDayOptions,
    },
    businessHoursStart: {
      type: 'string',
    },
    businessHoursEnd: {
      type: 'string',
    },
    customHoursStart: {
      type: 'string',
    },
    customHoursEnd: {
      type: 'string',
    },
    callerId: {
      type: 'string',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type IncomingCallNodeSchema = typeof schema;

