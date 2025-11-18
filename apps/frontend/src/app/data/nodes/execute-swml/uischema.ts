import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { ExecuteSWMLNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<ExecuteSWMLNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'SWML Code',
      elements: [
        {
          type: 'TextArea',
          label: 'SWML Script',
          scope: scope('properties.swmlCode'),
          placeholder: 'Enter SWML code...',
          minRows: 10,
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
      ],
    },
  ],
};

