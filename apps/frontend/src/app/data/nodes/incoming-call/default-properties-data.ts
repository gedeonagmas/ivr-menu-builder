import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { IncomingCallNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<IncomingCallNodeSchema> = {
  label: 'node.incomingCall.label',
  description: 'node.incomingCall.description',
  status: 'active',
  callSource: 'any',
  timeOfDay: 'any',
};

