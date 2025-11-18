import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, SetVariablesNodeSchema } from './schema';
import { uischema } from './uischema';

export const setVariablesNode: PaletteItem<SetVariablesNodeSchema> = {
  label: 'node.setVariables.label',
  description: 'node.setVariables.description',
  type: 'set-variables',
  icon: 'CirclesThreePlus',
  defaultPropertiesData,
  schema,
  uischema,
};

