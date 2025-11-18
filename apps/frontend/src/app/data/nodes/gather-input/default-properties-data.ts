import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { GatherInputNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<GatherInputNodeSchema> = {
  label: 'node.gatherInput.label',
  description: 'node.gatherInput.description',
  status: 'active',
  inputType: 'dtmf',
  maxDigits: 10,
  minDigits: 1,
  timeout: 5,
  finishOnKey: '#',
  speechTimeout: 3,
  language: 'en-US',
  variableName: 'userInput',
  menuOptions: [],
  decisionBranches: [],
};
