import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { SetVariablesNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<SetVariablesNodeSchema> = {
  label: 'node.setVariables.label',
  description: 'node.setVariables.description',
  status: 'active',
  variables: [],
};

