import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { finishOnKeyOptions, RecordVoicemailNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<RecordVoicemailNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Recording Settings',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Max Duration (seconds):',
            },
            {
              type: 'Number',
              scope: scope('properties.maxDuration'),
            },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Timeout (seconds):',
            },
            {
              type: 'Number',
              scope: scope('properties.timeout'),
            },
          ],
        },
        {
          type: 'Select',
          label: 'Finish On Key',
          scope: scope('properties.finishOnKey'),
          options: finishOnKeyOptions,
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Play Beep:',
            },
            {
              type: 'Switch',
              scope: scope('properties.playBeep'),
            },
          ],
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Storage & Notifications',
      elements: [
        {
          type: 'Text',
          label: 'Storage Location',
          scope: scope('properties.storageLocation'),
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Transcription:',
            },
            {
              type: 'Switch',
              scope: scope('properties.transcription'),
            },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Email Notification:',
            },
            {
              type: 'Switch',
              scope: scope('properties.emailNotification'),
            },
          ],
        },
        {
          type: 'Text',
          label: 'Email Address',
          scope: scope('properties.emailAddress'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.emailNotification'),
              schema: { const: true },
            },
          },
        },
      ],
    },
  ],
};

