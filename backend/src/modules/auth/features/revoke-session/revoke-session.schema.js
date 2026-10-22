export const revokeSessionSchema = {
  params: {
    type: 'object',
    required: ['familyId'],
    properties: {
      familyId: { type: 'string', format: 'uuid' },
    },
    additionalProperties: false,
  },
};
