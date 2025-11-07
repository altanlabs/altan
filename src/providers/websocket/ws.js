// TODO: move all redux here

import { batch } from 'react-redux';

import {
  addAltanerTemplate,
  updateAltanerTemplate,
  deleteAltanerTemplate,
  addAltanerTemplateVersion,
  updateAltanerTemplateVersion,
  deleteAltanerTemplateVersion,
} from '../../redux/slices/altaners';
import {
  addBase,
  updateBase,
  deleteBase,
  integrateRealTimeUpdates,
} from '../../redux/slices/bases';
import {
  setFileContent,
  updateFileContent,
  closeFile,
  setDiffChanges,
  deleteFile,
} from '../../redux/slices/codeEditor';
// Connection events now handled by dedicated handlers
import {
  addFlow,
  deleteFlow,
  addFlowExecution,
  addModule,
  addOrUpdateModuleExecution,
  addRouteCondition,
  deleteModules,
  deleteRouteCondition,
  updateFlow,
  updateFlowExecution,
  updateModule,
  updateRouteCondition,
  updateTool,
  addFlowTemplate,
  updateFlowTemplate,
  deleteFlowTemplate,
  addFlowTemplateVersion,
  updateFlowTemplateVersion,
  deleteFlowTemplateVersion,
  addWebhookSubscription,
  deleteWebhookSubscription,
} from '../../redux/slices/flows';
import {
  addWebhook,
  deleteWebhook,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  addWorkflowExecution,
  updateWorkflowExecution,
} from '../../redux/slices/general';
import { addNotification } from '../../redux/slices/notifications';
import { addMessageReaction, changeThreadReadState } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';

// TODO: add other redux actions for agent, gate and form
const TEMPLATE_ACTIONS = {
  template: {
    new: {
      flow: addFlowTemplate,
      altaner: addAltanerTemplate,
      // agent: ,
      // gate: ,
      // form:
    },
    update: {
      flow: updateFlowTemplate,
      altaner: updateAltanerTemplate,
      // agent: ,
      // gate: ,
      // form:
    },
    delete: {
      flow: deleteFlowTemplate,
      altaner: deleteAltanerTemplate,
      // agent: ,
      // gate: ,
      // form:
    },
  },
  version: {
    new: {
      flow: addFlowTemplateVersion,
      altaner: addAltanerTemplateVersion,
      // agent: ,
      // gate: ,
      // form:
    },
    update: {
      flow: updateFlowTemplateVersion,
      altaner: updateAltanerTemplateVersion,
      // agent: ,
      // gate: ,
      // form:
    },
    delete: {
      flow: deleteFlowTemplateVersion,
      altaner: deleteAltanerTemplateVersion,
      // agent: ,
      // gate: ,
      // form:
    },
  },
};

/**
 * Legacy WebSocket event handler
 *
 * This handler manages legacy events that haven't been migrated to the new entity.action format yet.
 * New entity events (message.*, thread.*, room.*, connection.*, etc.) are handled by dedicated handlers.
 *
 * @deprecated - New events should use the entity.action format (e.g., message.created, thread.updated)
 */
export const handleWebSocketEvent = async (data, user_id) => {
  switch (data.type) {
    // === Notification Events (Legacy) ===
    case 'NotificationNew':
      dispatch(addNotification(data.data.attributes));
      break;

    // === Webhook Subscription Events (Legacy) ===
    case 'WebhookSubscriptionNew':
      dispatch(addWebhookSubscription(data.data.attributes));
      break;
    case 'WebhookSubscriptionDelete':
      dispatch(deleteWebhookSubscription(data.data));
      break;

    // === Module Events (Legacy - Workflow/Flow related) ===
    case 'ActionNew':
    case 'SearchNew':
    case 'InternalNew':
    case 'AggregatorNew':
    case 'RepeaterNew':
    case 'IteratorNew':
    case 'TriggerNew':
    case 'RouterNew':
      dispatch(addModule(data.data.attributes));
      break;
    case 'ModuleUpdate':
    case 'ActionUpdate':
    case 'SearchUpdate':
    case 'InternalUpdate':
    case 'AggregatorUpdate':
    case 'RepeaterUpdate':
    case 'IteratorUpdate':
    case 'TriggerUpdate':
    case 'RouterUpdate':
      if (data.user_id && data.user_id === user_id) {
        break;
      }
      dispatch(
        updateModule({
          ...data.data.changes,
          id: data.data.ids[0],
        }),
      );
      break;
    case 'ModuleDelete':
    case 'ActionDelete':
    case 'SearchDelete':
    case 'InternalDelete':
    case 'AggregatorDelete':
    case 'RepeaterDelete':
    case 'IteratorDelete':
    case 'TriggerDelete':
    case 'RouterDelete':
      dispatch(deleteModules(data.data));
      break;
    case 'RouteConditionNew':
      dispatch(addRouteCondition(data.data.attributes));
      break;
    case 'RouteConditionUpdate':
      dispatch(updateRouteCondition(data.data));
      break;
    case 'RouteConditionDelete':
      dispatch(deleteRouteCondition(data.data));
      break;

    // === Tool & Workflow Events (Legacy) ===
    case 'ToolUpdate':
      dispatch(
        updateTool({
          ...data.data.changes,
          id: data.data.ids[0],
        }),
      );
      break;
    case 'WorkflowDelete':
      dispatch(deleteFlow(data.data.ids[0]));
      break;
    case 'WorkflowUpdate':
      dispatch(
        updateFlow({
          ...data.data.changes,
          id: data.data.ids[0],
        }),
      );
      break;
    case 'WorkflowNew':
      dispatch(addFlow(data.data.attributes));
      break;

    // === Execution Events (Legacy) ===
    case 'ModuleExecutionUpdate':
      dispatch(addOrUpdateModuleExecution({ ...data.data, timestamp: data.timestamp }));
      break;
    case 'FlowExecutionNew':
      dispatch(addFlowExecution(data.data.attributes));
      dispatch(addWorkflowExecution(data.data.attributes));
      break;
    case 'FlowExecutionUpdate':
      dispatch(updateFlowExecution({ id: data.data.ids[0], ...data.data.changes }));
      const updatePayload = {
        id: data.data.ids[0],
        changes: {
          ...data.data.changes,
          workflow_id: data.data.changes.workflow_id,
        },
      };
      dispatch(updateWorkflowExecution(updatePayload));
      break;

    // === Webhook Events (Legacy) ===
    case 'WebhookNew':
      dispatch(addWebhook(data.data.attributes));
      break;
    case 'WebhookDelete':
      dispatch(deleteWebhook(data.data.ids[0]));
      break;

    // === Subscription Events (Legacy) ===
    case 'SubscriptionNew':
      dispatch(addSubscription(data.data.attributes));
      break;
    case 'SubscriptionUpdate':
      dispatch(
        updateSubscription({
          id: data.data.ids[0],
          ...data.data.changes,
        }),
      );
      break;
    case 'SubscriptionDelete':
      dispatch(deleteSubscription(data.data.ids[0]));
      break;

    // === Template Events (Legacy - Complex multi-entity handler) ===
    case 'TemplateNew':
    case 'TemplateUpdate':
    case 'TemplateDelete':
    case 'TemplateVersionNew':
    case 'TemplateVersionUpdate':
    case 'TemplateVersionDelete':
      const mode = data.type.includes('Version') ? 'version' : 'template';
      const crud = data.type
        .replace(mode === 'version' ? 'TemplateVersion' : 'Template', '')
        .toLowerCase();
      const entity = ['flow', 'altaner', 'agent', 'form', 'gate'].find((e) => !!data[`${e}_id`]);
      const payload = {
        [`${entity}_id`]: data[`${entity}_id`],
      };
      if (crud !== 'new') {
        payload.ids = data.data.ids;
        if (crud === 'update') {
          payload.changes = data.data.changes;
        }
      } else {
        payload.attributes = data.data.attributes;
      }
      dispatch(TEMPLATE_ACTIONS[mode][crud][entity](payload));
      break;

    // === Base Events (Legacy - Database related) ===
    case 'BaseNew':
      dispatch(addBase(data.data.attributes));
      break;
    case 'BaseUpdate':
      dispatch(
        updateBase({
          id: data.data.ids ? data.data.ids[0] : data.data.id,
          ...data.data.changes,
        }),
      );
      break;
    case 'BaseDelete':
      const baseIdToDelete = data.data.ids ? data.data.ids[0] : data.data.id;
      dispatch(deleteBase(baseIdToDelete));
      break;
      const deleteTableName = data.table_name || data.data?.table_name;
      const deleteBaseId = data.base_id || data.data?.base_id;
      const deleteIds = data.ids || data.data?.ids;

      if (deleteTableName && deleteBaseId && deleteIds && Array.isArray(deleteIds)) {
        // Dispatch a thunk to access state and integrate updates
        dispatch((dispatch, getState) => {
          const state = getState();
          const base = state.bases?.bases?.[deleteBaseId];
          const table = base?.tables?.items?.find(
            (t) => t.db_name === deleteTableName || t.name === deleteTableName,
          );

          if (table?.id) {
            dispatch(
              integrateRealTimeUpdates({
                tableId: table.id,
                deletions: deleteIds,
              }),
            );
          }
        });
      }
      break;

    // === File Events (Legacy - Code Editor related) ===
    case 'FileUpdate' | 'FileDelete' | 'FileCreate':
      // console.log('data', data);
      // Set hasChanges to true when files are modified
      dispatch(setDiffChanges(true));
      switch (data.type) {
        case 'FileUpdate':
          // Handle file content updates from WebSocket
          batch(() => {
            data.data.updates.forEach((update) => {
              dispatch(
                updateFileContent({
                  path: update.file_name,
                  content: update.content,
                }),
              );
            });
          });
          break;
        case 'FileDelete':
          // Handle file deletion from WebSocket
          batch(() => {
            dispatch(deleteFile(data.data.file_name));
            dispatch(closeFile(data.data.file_name));
          });
          break;
        case 'FileCreate':
          // Handle new file creation from WebSocket
          dispatch(
            setFileContent({
              path: data.data.file_name,
              content: '', // Initial empty content, will be populated when file is opened
            }),
          );
          break;
      }
      break;

    // === Thread Read Events (Legacy - Not migrated yet) ===
    // TODO: Consider migrating to thread.read when ready
    case 'ThreadRead':
      dispatch(changeThreadReadState(data.data));
      break;

    // === Message Reaction Events (Legacy - Partially handled) ===
    // Note: message.reaction.created is handled in messageHandlers.js
    case 'MessageReactionNew':
      dispatch(addMessageReaction(data.data.attributes));
      break;
    case 'MessageReactionDelete':
      // TODO: Implement message reaction deletion handler
      // dispatch((data.data.attributes));
      break;

    default:
      // Unknown event type - may be handled by dedicated handlers
      // console.log('Received unknown event type', data);
      break;
  }
};
