import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, PlayAudioTTSNodeSchema } from './schema';
import { uischema } from './uischema';

export const playAudioTTSNode: PaletteItem<PlayAudioTTSNodeSchema> = {
  label: 'node.playAudioTTS.label',
  description: 'node.playAudioTTS.description',
  type: 'play-audio-tts',
  icon: 'Megaphone',
  defaultPropertiesData,
  schema,
  uischema,
};

