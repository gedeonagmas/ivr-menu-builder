import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { ForwardToPhoneNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<ForwardToPhoneNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Forward Settings',
      elements: [
        {
          type: 'Text',
          label: 'Phone Number',
          scope: scope('properties.phoneNumber'),
          placeholder: '+1234567890',
        },
        {
          type: 'Text',
          label: 'Caller ID',
          scope: scope('properties.callerId'),
        },
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Timeout (seconds):' },
            { type: 'Number', scope: scope('properties.timeout') },
          ],
        },
      ],
    },
  ],
};

