export const OBJECT_ID_PATTERN = '^[a-f0-9]{24}$';

export function objectIdParamsSchema(...names) {
  const properties = {};

  for (const name of names) {
    properties[name] = { type: 'string', pattern: OBJECT_ID_PATTERN };
  }

  return {
    type: 'object',
    required: names,
    properties,
    additionalProperties: false,
  };
}
