import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { ConditionsNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<ConditionsNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
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

