import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { UnsetVariablesNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<UnsetVariablesNodeSchema> = {
  label: 'node.unsetVariables.label',
  description: 'node.unsetVariables.description',
  status: 'active',
  variableNames: '',
};

