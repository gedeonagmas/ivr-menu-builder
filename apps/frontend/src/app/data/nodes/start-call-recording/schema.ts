import { sharedProperties } from '../shared/shared-properties';
import { statusOptions } from '../shared/general-information';
import { NodeSchema, Option } from '@workflow-builder/types/node-schema';

export const recordingFormatOptions: Option[] = [
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'OGG', value: 'ogg' },
];

export const recordingChannelsOptions: Option[] = [
  { label: 'Both (Stereo)', value: 'both' },
  { label: 'Inbound Only', value: 'inbound' },
  { label: 'Outbound Only', value: 'outbound' },
];

export const schema = {
  properties: {
    ...sharedProperties,
    recordingId: {
      type: 'string',
    },
    format: {
      type: 'string',
      options: recordingFormatOptions,
    },
    channels: {
      type: 'string',
      options: recordingChannelsOptions,
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

export type StartCallRecordingNodeSchema = typeof schema;

