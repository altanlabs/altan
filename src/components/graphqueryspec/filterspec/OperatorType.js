// OperatorType.js
export const OperatorType = {
  EQ: { key: 'EQ', value: '_eq', label: 'Equals', symbol: '=' },
  NEQ: { key: 'NEQ', value: '_neq', label: 'Not Equals', symbol: '!=' },
  GT: { key: 'GT', value: '_gt', label: 'Greater Than', symbol: '>' },
  LT: { key: 'LT', value: '_lt', label: 'Less Than', symbol: '<' },
  GTE: { key: 'GTE', value: '_gte', label: 'Greater Than or Equals', symbol: '>=' },
  LTE: { key: 'LTE', value: '_lte', label: 'Less Than or Equals', symbol: '<=' },
  BETWEEN: { key: 'BETWEEN', value: '_between', label: 'Between' },
  LIKE: { key: 'LIKE', value: '_like', label: 'Like' },
  STARTSWITH: { key: 'STARTSWITH', value: '_startswith', label: 'Starts With' },
  ENDSWITH: { key: 'ENDSWITH', value: '_endswith', label: 'Ends With' },
  CONTAINS: { key: 'CONTAINS', value: '_contains', label: 'Contains' },
  NLIKE: { key: 'NLIKE', value: '_nlike', label: 'Not Like' },
  IN: { key: 'IN', value: '_in', label: 'In' },
  NOTIN: { key: 'NOTIN', value: '_notin', label: 'Not In' },
  ALL: { key: 'ALL', value: '_all', label: 'All' },
  ANY: { key: 'ANY', value: '_any', label: 'Any' },
};
