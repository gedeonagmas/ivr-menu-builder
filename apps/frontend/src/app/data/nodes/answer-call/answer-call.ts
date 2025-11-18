import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, AnswerCallNodeSchema } from './schema';
import { uischema } from './uischema';

export const answerCallNode: PaletteItem<AnswerCallNodeSchema> = {
  label: 'node.answerCall.label',
  description: 'node.answerCall.description',
  type: 'answer-call',
  icon: 'PhoneIncoming',
  defaultPropertiesData,
  schema,
  uischema,
};

