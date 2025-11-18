import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { WaitHoldNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<WaitHoldNodeSchema> = {
  label: 'node.waitHold.label',
  description: 'node.waitHold.description',
  status: 'active',
  waitType: 'wait',
  duration: 10,
};

