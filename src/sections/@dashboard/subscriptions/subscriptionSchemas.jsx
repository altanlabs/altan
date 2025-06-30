export const SubscriptionPlanGroupCreate = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Group Name' },
    description: { type: 'string', title: 'Description' },
    account_id: { type: 'string', title: 'ID' },
    meta_data: {
      type: 'object',
    },
  },
  required: ['name', 'account_id'],
};

export const BillingOption = {
  type: 'object',
  properties: {
    price: {
      type: 'integer',
      title: 'Price',
      description: 'The price of the plan in cents',
      ['x-component']: 'PriceEditor',
    },
    currency: { type: 'string', title: 'Currency', default: 'USD' },
    billing_frequency: {
      type: 'string',
      title: 'Billing Frequency',
      enum: ['monthly', 'yearly', 'weekly'],
      default: 'monthly',
    },
    billing_cycle: { type: 'integer', title: 'Billing Cycle', default: 1 },
  },
  required: ['price', 'billing_frequency'],
};

export const SubscriptionPlanCreate = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Plan Name' },
    description: { type: 'string', title: 'Description' },
    credits: { type: 'integer', title: 'Credits' },
    credit_type: { type: 'string', title: 'Credit Type (unit)' },
    account_id: { type: 'string', title: 'ID' },
    group_id: { type: 'string', title: 'Group ID' },
    meta_data: {
      type: 'object',
      title: 'Custom Data',
      properties: {
        features: {
          type: 'array',
          title: 'Features',
          items: { type: 'string' },
        },
      },
    },
    billing_options: {
      type: 'array',
      title: 'Billing Options',
      items: BillingOption,
      minItems: 1,
    },
  },
  required: ['name', 'billing_options'],
};
