import { ACTION_SCHEMA } from './action.js';
import { AGGEGATOR_SCHEMA } from './aggregator.js';
import { INTERNAL_SCHEMA } from './internal.js';
import { ITERATOR_SCHEMA } from './iterator.js';
import { ROUTER_SCHEMA } from './router.js';
import { SEARCH_SCHEMA } from './search.js';
import { TRIGGER_SCHEMA } from './trigger.js';

const MODULE_SCHEMA = {
  action: ACTION_SCHEMA,
  search: SEARCH_SCHEMA,
  aggregator: AGGEGATOR_SCHEMA,
  repeater: {},
  iterator: ITERATOR_SCHEMA,
  router: ROUTER_SCHEMA,
  internal: INTERNAL_SCHEMA,
  trigger: TRIGGER_SCHEMA,
};

export { MODULE_SCHEMA };
