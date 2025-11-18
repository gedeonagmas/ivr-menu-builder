import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { SetVariablesNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<SetVariablesNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Variables',
      elements: [
        {
          type: 'TextArea',
          label: 'Variables (JSON array)',
          scope: scope('properties.variables'),
          placeholder: '[{"name": "var1", "value": "value1"}, {"name": "var2", "value": "value2"}]',
          minRows: 5,
        },
      ],
    },
  ],
};

