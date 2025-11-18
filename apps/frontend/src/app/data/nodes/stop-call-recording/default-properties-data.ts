import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { StopCallRecordingNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<StopCallRecordingNodeSchema> = {
  label: 'node.stopCallRecording.label',
  description: 'node.stopCallRecording.description',
  status: 'active',
  recordingId: '',
};

