import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { UnsetVariablesNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<UnsetVariablesNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Variables',
      elements: [
        {
          type: 'Text',
          label: 'Variable Names (comma-separated)',
          scope: scope('properties.variableNames'),
          placeholder: 'var1, var2, var3',
        },
      ],
    },
  ],
};

