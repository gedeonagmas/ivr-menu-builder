import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const languageOptions: Option[] = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' },
  { label: 'Italian', value: 'it-IT' },
];

export const exitActionOptions: Option[] = [
  { label: 'None', value: '' },
  { label: 'Hangup', value: 'hangup' },
  { label: 'Return to Previous Menu', value: 'return' },
];

const menuOption = {
  type: 'object',
  properties: {
    option: { type: 'string' }, // The digit (e.g., "1", "2")
    destination: { type: 'string' }, // The destination (e.g., "1001", "voicemail:1001")
    order: { type: 'number' },
    description: { type: 'string' },
    enabled: { type: 'boolean' },
  },
} as const;

export const schema = {
  properties: {
    ...sharedProperties,
    // Basic IVR Menu Settings
    extension: {
      type: 'string',
    },
    parentMenu: {
      type: 'string',
    },
    language: {
      type: 'string',
      options: languageOptions,
    },
    context: {
      type: 'string',
    },
    // Greetings
    greetLong: {
      type: 'string',
    },
    greetShort: {
      type: 'string',
    },
    // Options
    menuOptions: {
      type: 'array',
      items: menuOption,
    },
    // Timeout and Exit
    timeout: {
      type: 'number',
    },
    exitAction: {
      type: 'string',
      options: exitActionOptions,
    },
    // Direct Dial
    directDial: {
      type: 'boolean',
    },
    // Ring Back
    ringBack: {
      type: 'string',
    },
    // Caller ID
    callerIdNamePrefix: {
      type: 'string',
    },
    // Status
    enabled: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
    // Description
    description: {
      type: 'string',
    },
  },
} satisfies NodeSchema;

export type IvrMenuNodeSchema = typeof schema;


