import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { HangUpNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<HangUpNodeSchema> = {
  label: 'node.hangUp.label',
  description: 'node.hangUp.description',
  status: 'active',
  reason: 'Call completed',
};

