import { UISchema } from '@/features/json-form/types/uischema';
import { generalInformation } from '../shared/general-information';
import { StartCallRecordingNodeSchema } from './schema';
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
      ],
    },
  ],
};

