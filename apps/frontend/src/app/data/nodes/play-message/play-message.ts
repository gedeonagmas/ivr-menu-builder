import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, PlayMessageNodeSchema } from './schema';
import { uischema } from './uischema';

export const playMessageNode: PaletteItem<PlayMessageNodeSchema> = {
  label: 'node.playMessage.label',
  description: 'node.playMessage.description',
  type: 'play-message',
  icon: 'Megaphone',
  defaultPropertiesData,
  schema,
  uischema,
};

