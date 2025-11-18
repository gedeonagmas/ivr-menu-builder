import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { HangUpNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<HangUpNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Hang Up Settings',
      elements: [
        {
          type: 'Text',
          label: 'Reason',
          scope: scope('properties.reason'),
          placeholder: 'e.g., Call completed, No answer',
        },
      ],
    },
  ],
};

