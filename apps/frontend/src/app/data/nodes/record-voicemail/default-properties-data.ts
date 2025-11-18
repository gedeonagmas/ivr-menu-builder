import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { RecordVoicemailNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<RecordVoicemailNodeSchema> = {
  label: 'node.recordVoicemail.label',
  description: 'node.recordVoicemail.description',
  status: 'active',
  maxDuration: 300,
  timeout: 10,
  finishOnKey: '#',
  playBeep: true,
  transcription: false,
  emailNotification: false,
  storageLocation: 'default',
};

