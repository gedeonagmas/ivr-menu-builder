import { PaletteItem } from '@workflow-builder/types/common';
import { defaultPropertiesData } from './default-properties-data';
import { schema, UnsetVariablesNodeSchema } from './schema';
import { uischema } from './uischema';

export const unsetVariablesNode: PaletteItem<UnsetVariablesNodeSchema> = {
  label: 'node.unsetVariables.label',
  description: 'node.unsetVariables.description',
  type: 'unset-variables',
  icon: 'CirclesThree',
  defaultPropertiesData,
  schema,
  uischema,
};

