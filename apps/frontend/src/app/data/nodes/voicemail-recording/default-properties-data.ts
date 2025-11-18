import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { VoicemailRecordingNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<VoicemailRecordingNodeSchema> = {
  label: 'node.voicemailRecording.label',
  description: 'node.voicemailRecording.description',
  status: 'active',
  maxDuration: 300,
  timeout: 10,
  finishOnKey: '#',
  playBeep: true,
  transcription: false,
  emailNotification: false,
  storageLocation: 'default',
};

