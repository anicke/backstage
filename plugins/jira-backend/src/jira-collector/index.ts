import bugSchema from './default-schemas/bug-schema.json';
import bugUiSchema from './default-schemas/bug-uiSchema.json';
import featureRequestSchema from './default-schemas/feature_request-schema.json';
import featureRequestUiSchema from './default-schemas/feature_request-uiSchema.json';

/**
 * Return the default schemas.
 */
export const getDefaultSchemas = () => {
  return [
    {
      title: 'Bug Report',
      schema: bugSchema,
      uiSchema: bugUiSchema,
    },
    {
      title: 'Feature Request',
      schema: featureRequestSchema,
      uiSchema: featureRequestUiSchema,
    },
  ];
};
