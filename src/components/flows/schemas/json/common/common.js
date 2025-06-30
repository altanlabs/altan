const DATA_TYPE = {
  type: 'string',
  enum: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime', 'bytes'],
  enumDescriptions: [
    'String value',
    'Object value',
    'Array of values',
    'Boolean value',
    'Numeric value',
    'Integer value',
    'Datetime value',
    'Bytes value',
  ],
  default: 'string',
};

export { DATA_TYPE };
