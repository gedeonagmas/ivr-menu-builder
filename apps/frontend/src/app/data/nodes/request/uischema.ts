import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { httpMethodOptions, RequestNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<RequestNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Request Settings',
      elements: [
        {
          type: 'Text',
          label: 'URL',
          scope: scope('properties.url'),
          placeholder: 'https://api.example.com/endpoint',
        },
        {
          type: 'Select',
          label: 'Method',
          scope: scope('properties.method'),
          options: httpMethodOptions,
        },
        {
          type: 'TextArea',
          label: 'Headers (JSON)',
          scope: scope('properties.headers'),
          placeholder: '{"Content-Type": "application/json"}',
          minRows: 3,
        },
        {
          type: 'TextArea',
          label: 'Body',
          scope: scope('properties.body'),
          placeholder: 'Request body...',
          minRows: 5,
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Condition Branches',
      elements: [
        {
          type: 'DecisionBranches',
          scope: scope('properties.decisionBranches'),
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Connectors',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Else Connector:' },
            { type: 'Switch', scope: scope('properties.hasElse') },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Failure Connector:' },
            { type: 'Switch', scope: scope('properties.hasFailure') },
          ],
        },
      ],
    },
  ],
};

