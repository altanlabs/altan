import { combineReducers } from 'redux';
// import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// slices
import agentsReducer from './slices/agents';
import altanersReducer from './slices/altaners';
import basesReducer from './slices/bases';
import codeEditorReducer from './slices/codeEditor';
import connectionsReducer from './slices/connections';
import flowsReducer from './slices/flows';
import gateReducer from './slices/gate';
import gatesReducer from './slices/gates';
import generalReducer from './slices/general';
import marketplaceReducer from './slices/marketplace';
import mediaReducer from './slices/media';
import moneyReducer from './slices/money';
import notificationsReducer from './slices/notifications';
import roomsReducer from './slices/room';
import spaceReducer from './slices/spaces';
import subscriptionsReducer from './slices/subscriptions';
import superadminReducer from './slices/superadmin';
import userReducer from './slices/user';

// ----------------------------------------------------------------------

export const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

export const productPersistConfig = {
  key: 'product',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['sortBy', 'checkout'],
};

const rootReducer = combineReducers({
  agents: agentsReducer,
  general: generalReducer,
  spaces: spaceReducer,
  superadmin: superadminReducer,
  user: userReducer,
  media: mediaReducer,
  notifications: notificationsReducer,
  connections: connectionsReducer,
  gates: gatesReducer,
  flows: flowsReducer,
  altaners: altanersReducer,
  subscriptions: subscriptionsReducer,
  money: moneyReducer,
  marketplace: marketplaceReducer,
  bases: basesReducer,
  codeEditor: codeEditorReducer,
  room: roomsReducer,
  gate: gateReducer,
});

export default rootReducer;
