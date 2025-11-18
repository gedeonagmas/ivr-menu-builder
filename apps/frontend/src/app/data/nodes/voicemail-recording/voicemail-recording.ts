import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, VoicemailRecordingNodeSchema } from './schema';
import { uischema } from './uischema';

export const voicemailRecordingNode: PaletteItem<VoicemailRecordingNodeSchema> = {
  label: 'node.voicemailRecording.label',
  description: 'node.voicemailRecording.description',
  type: 'voicemail-recording',
  icon: 'Microphone',
  defaultPropertiesData,
  schema,
  uischema,
};

