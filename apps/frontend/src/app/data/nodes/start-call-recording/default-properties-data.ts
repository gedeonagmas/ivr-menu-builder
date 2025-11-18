import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { StartCallRecordingNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<StartCallRecordingNodeSchema> = {
  label: 'node.startCallRecording.label',
  description: 'node.startCallRecording.description',
  status: 'active',
  recordingId: '',
};

