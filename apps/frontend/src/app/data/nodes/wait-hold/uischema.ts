import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { waitTypeOptions, WaitHoldNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<WaitHoldNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Wait/Hold Settings',
      elements: [
        {
          type: 'Select',
          label: 'Wait Type',
          scope: scope('properties.waitType'),
          options: waitTypeOptions,
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Duration (seconds):',
            },
            {
              type: 'Number',
              scope: scope('properties.duration'),
            },
          ],
        },
        {
          type: 'Text',
          label: 'Hold Music URL',
          scope: scope('properties.holdMusic'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.waitType'),
              schema: { const: 'hold' },
            },
          },
        },
        {
          type: 'TextArea',
          label: 'Hold Message',
          scope: scope('properties.holdMessage'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.waitType'),
              schema: { const: 'holdMessage' },
            },
          },
        },
      ],
    },
  ],
};

