import { OBJECT_ID_PATTERN } from '#src/shared/schemas/object-id-params.schema.js';

export const objectIdListSchema = {
  type: 'array',
  minItems: 1,
  maxItems: 100,
  uniqueItems: true,
  items: { type: 'string', pattern: OBJECT_ID_PATTERN },
};
