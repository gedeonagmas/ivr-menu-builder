import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { IvrMenuNodeSchema, languageOptions, exitActionOptions } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<IvrMenuNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Basic Settings',
      elements: [
        {
          type: 'Text',
          label: 'Extension',
          scope: scope('properties.extension'),
          placeholder: 'e.g., 1000',
        },
        {
          type: 'Text',
          label: 'Parent Menu',
          scope: scope('properties.parentMenu'),
          placeholder: 'Optional parent menu UUID',
        },
        {
          type: 'Select',
          label: 'Language',
          scope: scope('properties.language'),
          options: languageOptions,
        },
        {
          type: 'Text',
          label: 'Context',
          scope: scope('properties.context'),
          placeholder: 'default',
        },
        {
          type: 'Checkbox',
          label: 'Enabled',
          scope: scope('properties.enabled'),
        },
        {
          type: 'Text',
          label: 'Description',
          scope: scope('properties.description'),
          placeholder: 'Enter description',
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Greetings',
      elements: [
        {
          type: 'Text',
          label: 'Greet Long',
          scope: scope('properties.greetLong'),
          placeholder: 'Long greeting played when entering the menu',
        },
        {
          type: 'Text',
          label: 'Greet Short',
          scope: scope('properties.greetShort'),
          placeholder: 'Short greeting played when returning to the menu',
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
          placeholder: '[{"option":"1","destination":"1001","order":1,"description":"Option 1","enabled":true}]',
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Timeout & Exit',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Timeout (ms):' },
            { type: 'Number', scope: scope('properties.timeout') },
          ],
        },
        {
          type: 'Select',
          label: 'Exit Action',
          scope: scope('properties.exitAction'),
          options: exitActionOptions,
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Advanced Settings',
      elements: [
        {
          type: 'Checkbox',
          label: 'Direct Dial',
          scope: scope('properties.directDial'),
        },
        {
          type: 'Text',
          label: 'Ring Back',
          scope: scope('properties.ringBack'),
          placeholder: 'What caller will hear while destination is being called',
        },
        {
          type: 'Text',
          label: 'Caller ID Name Prefix',
          scope: scope('properties.callerIdNamePrefix'),
          placeholder: 'Prefix for caller ID name',
        },
      ],
    },
  ],
};

