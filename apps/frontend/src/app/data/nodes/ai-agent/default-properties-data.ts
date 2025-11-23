import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { AiAgentNodeSchema } from './schema';
import { statusOptions } from '../shared/general-information';

export const defaultPropertiesData: NodeDataProperties<AiAgentNodeSchema> = {
  label: 'node.aiAgent.label',
  description: 'node.aiAgent.description',
  status: statusOptions.active.value,
  chatModel: '',
  memory: '',
  tools: [],
  systemPrompt: '',
};
