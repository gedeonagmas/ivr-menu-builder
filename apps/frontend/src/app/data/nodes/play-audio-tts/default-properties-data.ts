import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { PlayAudioTTSNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<PlayAudioTTSNodeSchema> = {
  label: 'node.playAudioTTS.label',
  description: 'node.playAudioTTS.description',
  status: 'active',
  messageType: 'tts',
  voice: 'default',
  language: 'en-US',
  speed: 1,
  volume: 100,
  interruptible: true,
};

