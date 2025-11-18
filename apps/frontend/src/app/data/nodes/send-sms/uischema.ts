import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { SendSMSNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<SendSMSNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'SMS Settings',
      elements: [
        {
          type: 'Text',
          label: 'Phone Number',
          scope: scope('properties.phoneNumber'),
          placeholder: '+1234567890',
        },
        {
          type: 'TextArea',
          label: 'Message',
          scope: scope('properties.message'),
          placeholder: 'Enter SMS message text...',
          minRows: 5,
        },
      ],
    },
  ],
};

