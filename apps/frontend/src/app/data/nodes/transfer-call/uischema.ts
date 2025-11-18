import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { transferTypeOptions, transferMethodOptions, TransferCallNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<TransferCallNodeSchema>;

export const uischema: UISchema = {
  type: 'VerticalLayout',
  elements: [
    ...(generalInformation ? [generalInformation] : []),
    {
      type: 'Accordion',
      label: 'Transfer Settings',
      elements: [
        {
          type: 'Select',
          label: 'Transfer Type',
          scope: scope('properties.transferType'),
          options: transferTypeOptions,
        },
        {
          type: 'Text',
          label: 'Agent ID',
          scope: scope('properties.agentId'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.transferType'),
              schema: { const: 'agent' },
            },
          },
        },
        {
          type: 'Text',
          label: 'Queue ID',
          scope: scope('properties.queueId'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.transferType'),
              schema: { const: 'queue' },
            },
          },
        },
        {
          type: 'Text',
          label: 'Phone Number',
          scope: scope('properties.phoneNumber'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.transferType'),
              schema: { const: 'phoneNumber' },
            },
          },
        },
        {
          type: 'Text',
          label: 'SIP URI',
          scope: scope('properties.sipUri'),
          rule: {
            effect: 'SHOW',
            condition: {
              scope: scope('properties.transferType'),
              schema: { const: 'sip' },
            },
          },
        },
        {
          type: 'Select',
          label: 'Transfer Method',
          scope: scope('properties.transferMethod'),
          options: transferMethodOptions,
        },
        {
          type: 'Text',
          label: 'Caller ID',
          scope: scope('properties.callerId'),
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
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Label',
              text: 'Record Call:',
            },
            {
              type: 'Switch',
              scope: scope('properties.recordCall'),
            },
          ],
        },
      ],
    },
  ],
};

