import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { RequestNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<RequestNodeSchema> = {
  label: 'node.request.label',
  description: 'node.request.description',
  status: 'active',
  url: '',
  method: 'GET',
  headers: '',
  body: '',
  decisionBranches: [],
  hasElse: true,
  hasFailure: true,
};

