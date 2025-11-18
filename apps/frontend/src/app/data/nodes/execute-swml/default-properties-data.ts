import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { ExecuteSWMLNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<ExecuteSWMLNodeSchema> = {
  label: 'node.executeSWML.label',
  description: 'node.executeSWML.description',
  status: 'active',
  swmlCode: '',
  decisionBranches: [],
  hasElse: true,
};

