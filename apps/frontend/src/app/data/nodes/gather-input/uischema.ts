import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { inputTypeOptions, GatherInputNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<GatherInputNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Input Settings',
      elements: [
        {
          type: 'Select',
          label: 'Input Type',
          scope: scope('properties.inputType'),
          options: inputTypeOptions,
        },
        {
          type: 'Text',
          label: 'Variable Name',
          scope: scope('properties.variableName'),
          placeholder: 'e.g., userInput, accountNumber',
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'DTMF Settings',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Min Digits:' },
            { type: 'Number', scope: scope('properties.minDigits') },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Max Digits:' },
            { type: 'Number', scope: scope('properties.maxDigits') },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Timeout (seconds):' },
            { type: 'Number', scope: scope('properties.timeout') },
          ],
        },
        {
          type: 'Text',
          label: 'Finish On Key',
          scope: scope('properties.finishOnKey'),
          placeholder: '#',
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Menu Options',
      elements: [
        {
          type: 'Text',
          label: 'Menu Options (JSON array)',
          scope: scope('properties.menuOptions'),
          placeholder: '[{"key":"1","label":"Option 1","value":"option1"}]',
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Decision Branches',
      elements: [
        {
          type: 'DecisionBranches',
          scope: scope('properties.decisionBranches'),
        },
      ],
    },
  ],
};
