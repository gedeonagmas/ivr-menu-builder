import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { callSourceOptions, timeOfDayOptions, IncomingCallNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<IncomingCallNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Call Source Settings',
      elements: [
        {
          type: 'Select',
          label: 'Call Source',
          scope: scope('properties.callSource'),
          options: callSourceOptions,
        },
        {
          type: 'Text',
          label: 'Phone Number',
          scope: scope('properties.phoneNumber'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.callSource'),
              schema: { const: 'specific' },
            },
          },
        },
        {
          type: 'Text',
          label: 'Number Pattern (Regex)',
          scope: scope('properties.numberPattern'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.callSource'),
              schema: { const: 'pattern' },
            },
          },
        },
        {
          type: 'Text',
          label: 'Contact List',
          scope: scope('properties.contactList'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.callSource'),
              schema: { const: 'contactList' },
            },
          },
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Time Restrictions',
      elements: [
        {
          type: 'Select',
          label: 'Time of Day',
          scope: scope('properties.timeOfDay'),
          options: timeOfDayOptions,
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Text',
              label: 'Start Time',
              scope: scope('properties.customHoursStart'),
              placeholder: 'HH:MM',
              rule: {
                effect: 'SHOW',
                condition: {
                  scope: scope('properties.timeOfDay'),
                  schema: { const: 'custom' },
                },
              },
            },
            {
              type: 'Text',
              label: 'End Time',
              scope: scope('properties.customHoursEnd'),
              placeholder: 'HH:MM',
              rule: {
                effect: 'SHOW',
                condition: {
                  scope: scope('properties.timeOfDay'),
                  schema: { const: 'custom' },
                },
              },
            },
          ],
        },
      ],
    },
  ],
};

