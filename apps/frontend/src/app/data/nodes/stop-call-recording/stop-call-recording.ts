import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, StopCallRecordingNodeSchema } from './schema';
import { uischema } from './uischema';

export const stopCallRecordingNode: PaletteItem<StopCallRecordingNodeSchema> = {
  label: 'node.stopCallRecording.label',
  description: 'node.stopCallRecording.description',
  type: 'stop-call-recording',
  icon: 'Stop',
  defaultPropertiesData,
  schema,
  uischema,
};

