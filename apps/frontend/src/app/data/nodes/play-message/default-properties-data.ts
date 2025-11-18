import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { PlayMessageNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<PlayMessageNodeSchema> = {
  label: 'node.playMessage.label',
  description: 'node.playMessage.description',
  status: 'active',
  messageType: 'tts',
  voice: 'default',
  language: 'en-US',
  speed: 1,
  volume: 100,
  interruptible: true,
};

