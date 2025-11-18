import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { AnswerCallNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<AnswerCallNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
  ],
};

