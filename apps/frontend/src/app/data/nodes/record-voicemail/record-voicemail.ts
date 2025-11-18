import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, RecordVoicemailNodeSchema } from './schema';
import { uischema } from './uischema';

export const recordVoicemailNode: PaletteItem<RecordVoicemailNodeSchema> = {
  label: 'node.recordVoicemail.label',
  description: 'node.recordVoicemail.description',
  type: 'record-voicemail',
  icon: 'Microphone',
  defaultPropertiesData,
  schema,
  uischema,
};

