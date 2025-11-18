import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const messageTypeOptions: Option[] = [
  { label: 'Text to Speech', value: 'tts' },
  { label: 'Audio File', value: 'audio' },
  { label: 'Pre-recorded Message', value: 'prerecorded' },
];

export const voiceOptions: Option[] = [
  { label: 'Default', value: 'default' },
  { label: 'Male Voice', value: 'male' },
  { label: 'Female Voice', value: 'female' },
  { label: 'Neutral Voice', value: 'neutral' },
];

export const languageOptions: Option[] = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' },
];

export const schema = {
  properties: {
    ...sharedProperties,
    messageType: {
      type: 'string',
      options: messageTypeOptions,
      placeholder: 'Select Message Type...',
    },
    messageText: {
      type: 'string',
    },
    audioFile: {
      type: 'string',
    },
    prerecordedMessage: {
      type: 'string',
    },
    voice: {
      type: 'string',
      options: voiceOptions,
    },
    language: {
      type: 'string',
      options: languageOptions,
    },
    speed: {
      type: 'number',
    },
    volume: {
      type: 'number',
    },
    interruptible: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      options: Object.values(statusOptions),
    },
  },
} satisfies NodeSchema;

export type PlayMessageNodeSchema = typeof schema;

