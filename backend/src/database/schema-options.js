function toJson(_document, returned) {
  returned.id = returned._id.toString();
  delete returned._id;

  return returned;
}

export const SCHEMA_OPTIONS = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: false, transform: toJson },
};

export const SUBDOCUMENT_OPTIONS = {
  _id: false,
};
