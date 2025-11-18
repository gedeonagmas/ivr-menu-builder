import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { TransferCallNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<TransferCallNodeSchema> = {
  label: 'node.transferCall.label',
  description: 'node.transferCall.description',
  status: 'active',
  transferType: 'agent',
  transferMethod: 'warm',
  timeout: 30,
  recordCall: false,
};

