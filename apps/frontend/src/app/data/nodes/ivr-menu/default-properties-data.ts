import { NodeDataProperties } from '@/features/json-form/types/default-properties';
import { IvrMenuNodeSchema } from './schema';

export const defaultPropertiesData: NodeDataProperties<IvrMenuNodeSchema> = {
  label: 'node.ivrMenu.label',
  description: 'node.ivrMenu.description',
  status: 'active',
  extension: '1000',
  parentMenu: '',
  language: 'en-US',
  context: 'default',
  greetLong: '',
  greetShort: '',
  menuOptions: [],
  timeout: 3000,
  exitAction: '',
  directDial: false,
  ringBack: '',
  callerIdNamePrefix: '',
  enabled: true,
};

