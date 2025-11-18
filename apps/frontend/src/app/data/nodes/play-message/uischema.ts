import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { messageTypeOptions, voiceOptions, languageOptions, PlayMessageNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<PlayMessageNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Message Settings',
      elements: [
        {
          type: 'Select',
          label: 'Message Type',
          scope: scope('properties.messageType'),
          options: messageTypeOptions,
        },
        {
          type: 'TextArea',
          label: 'Message Text',
          scope: scope('properties.messageText'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.messageType'),
              schema: { const: 'tts' },
            },
          },
        },
        {
          type: 'Text',
          label: 'Audio File URL',
          scope: scope('properties.audioFile'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.messageType'),
              schema: { const: 'audio' },
            },
          },
        },
        {
          type: 'Text',
          label: 'Pre-recorded Message ID',
          scope: scope('properties.prerecordedMessage'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.messageType'),
              schema: { const: 'prerecorded' },
            },
          },
        },
      ],
    },
    {
      type: 'Accordion',
      label: 'Voice Settings',
      elements: [
        {
          type: 'Select',
          label: 'Voice',
          scope: scope('properties.voice'),
          options: voiceOptions,
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.messageType'),
              schema: { const: 'tts' },
            },
          },
        },
        {
          type: 'Select',
          label: 'Language',
          scope: scope('properties.language'),
          options: languageOptions,
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.messageType'),
              schema: { const: 'tts' },
            },
          },
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Speed:',
            },
            {
              type: 'Number',
              scope: scope('properties.speed'),
              rule: {
                effect: 'SHOW',
                condition: {
                  scope: scope('properties.messageType'),
                  schema: { const: 'tts' },
                },
              },
            },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Volume:',
            },
            {
              type: 'Number',
              scope: scope('properties.volume'),
            },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Interruptible:',
            },
            {
              type: 'Switch',
              scope: scope('properties.interruptible'),
            },
          ],
        },
      ],
    },
  ],
};

