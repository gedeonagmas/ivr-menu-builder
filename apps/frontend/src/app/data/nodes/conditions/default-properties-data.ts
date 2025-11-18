import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { ConditionsNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<ConditionsNodeSchema> = {
  label: 'node.conditions.label',
  description: 'node.conditions.description',
  status: 'active',
  decisionBranches: [],
  hasElse: true,
};

