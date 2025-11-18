import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { StopCallRecordingNodeSchema } from './schema';
import { getScope } from '@/features/json-form/utils/get-scope';

const scope = getScope<StopCallRecordingNodeSchema>;

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
          placeholder: 'Optional: Recording ID to stop',
        },
      ],
    },
  ],
};

