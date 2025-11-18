import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, StartCallRecordingNodeSchema } from './schema';
import { uischema } from './uischema';

export const startCallRecordingNode: PaletteItem<StartCallRecordingNodeSchema> = {
  label: 'node.startCallRecording.label',
  description: 'node.startCallRecording.description',
  type: 'start-call-recording',
  icon: 'Record',
  defaultPropertiesData,
  schema,
  uischema,
};

