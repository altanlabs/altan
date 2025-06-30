import { REQUEST_SETTINGS_SCHEMA } from './common/request';
import { TOOL_SCHEMA } from './common/tool';

const ACTION_SCHEMA = {
  properties: {
    tool: TOOL_SCHEMA,
    // asynchronous: {
    //   title: "Asynchronous Call",
    //   description: "Wether the action should be blocking or asynchronous.",
    //   type: "boolean",
    //   default: false,
    // },
    settings: REQUEST_SETTINGS_SCHEMA,
  },
  required: ['asynchronous'],
};

export { ACTION_SCHEMA };
