import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { recordingFormatOptions, recordingChannelsOptions, StartCallRecordingNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<StartCallRecordingNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Recording Settings',
      elements: [
        {
          type: 'Text',
          label: 'Recording ID',
          scope: scope('properties.recordingId'),
          placeholder: 'Optional: Custom recording ID',
        },
        {
          type: 'Select',
          label: 'Format',
          scope: scope('properties.format'),
          options: recordingFormatOptions,
        },
        {
          type: 'Select',
          label: 'Channels',
          scope: scope('properties.channels'),
          options: recordingChannelsOptions,
        },
        {
          type: 'Text',
          label: 'Storage Location',
          scope: scope('properties.storageLocation'),
          placeholder: 'e.g., s3://bucket/path',
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Additional Options',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Transcription:' },
            { type: 'Switch', scope: scope('properties.transcription') },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Label', text: 'Email Notification:' },
            { type: 'Switch', scope: scope('properties.emailNotification') },
          ],
        },
        {
          type: 'Text',
          label: 'Email Address',
          scope: scope('properties.emailAddress'),
          placeholder: 'notifications@example.com',
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

