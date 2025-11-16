import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';

// slices
import accountsTemplatesReducer from './slices/accountsTemplates';
import accountTemplatesReducer from './slices/accountTemplates';
import agentsReducer from './slices/agents';
import altanersReducer from './slices/altaners';
import basesReducer from './slices/bases';
import cloudReducer from './slices/cloud';
import codeEditorReducer from './slices/codeEditor';
import commitsReducer from './slices/commits';
import connectionsReducer from './slices/connections';
import flowsReducer from './slices/flows';
import generalReducer from './slices/general';
import marketplaceReducer from './slices/marketplace';
import mcpReducer from './slices/mcp';
import mediaReducer from './slices/media';
import moneyReducer from './slices/money';
import previewControlReducer from './slices/previewControl';
import roomsReducer from './slices/room';
import servicesReducer from './slices/services';
import spaceReducer from './slices/spaces';
import tasksReducer from './slices/tasks';
import templatesReducer from './slices/templates';
import templateVersionsReducer from './slices/templateVersions';

// ----------------------------------------------------------------------

export const rootPersistConfig: PersistConfig<RootState> = {
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
  accountsTemplates: accountsTemplatesReducer,
  accountTemplates: accountTemplatesReducer,
  agents: agentsReducer,
  general: generalReducer,
  spaces: spaceReducer,
  media: mediaReducer,
  previewControl: previewControlReducer,
  connections: connectionsReducer,
  flows: flowsReducer,
  altaners: altanersReducer,
  money: moneyReducer,
  marketplace: marketplaceReducer,
  mcp: mcpReducer,
  bases: basesReducer,
  cloud: cloudReducer,
  codeEditor: codeEditorReducer,
  commits: commitsReducer,
  room: roomsReducer,
  services: servicesReducer,
  tasks: tasksReducer,
  templates: templatesReducer,
  templateVersions: templateVersionsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;

