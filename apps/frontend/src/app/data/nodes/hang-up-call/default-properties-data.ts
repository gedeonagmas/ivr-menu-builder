import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { HangUpCallNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<HangUpCallNodeSchema> = {
  label: 'node.hangUpCall.label',
  description: 'node.hangUpCall.description',
  status: 'active',
  reason: 'Call completed',
};

