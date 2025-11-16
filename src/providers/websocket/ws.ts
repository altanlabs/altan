/**
 * Legacy WebSocket event handler (TypeScript)
 * This handler manages legacy events that haven't been migrated to the new entity.action format yet.
 * New entity events (message.*, thread.*, room.*, connection.*, etc.) are handled by dedicated handlers.
 *
 * @deprecated - New events should use the entity.action format (e.g., message.created, thread.updated)
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  setFileContent,
  updateFileContent,
  closeFile,
  setDiffChanges,
  deleteFile,
} from '../../redux/slices/codeEditor';
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
} from '../../redux/slices/general/index';
import { dispatch } from '../../redux/store';

// Type definitions for legacy WebSocket events
interface LegacyEventData {
  ids?: string[];
  changes?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  updates?: Array<{
    file_name: string;
    content: string;
  }>;
  file_name?: string;
  timestamp?: number;
  workflow_id?: string;
  [key: string]: unknown;
}

interface LegacyWebSocketEvent {
  type: string;
  data?: LegacyEventData;
  user_id?: string;
  timestamp?: number;
  flow_id?: string;
  altaner_id?: string;
  agent_id?: string;
  form_id?: string;
  gate_id?: string;
  [key: string]: unknown;
}

type EntityType = 'flow' | 'altaner' | 'agent' | 'form' | 'gate';
type CrudOperation = 'new' | 'update' | 'delete';
type TemplateMode = 'template' | 'version';

// Type for template actions - using any to allow Redux action creators with different payload types
type TemplateActionFunction = (payload: any) => { type: string; payload: any };

interface TemplateActions {
  template: Record<CrudOperation, Partial<Record<EntityType, TemplateActionFunction>>>;
  version: Record<CrudOperation, Partial<Record<EntityType, TemplateActionFunction>>>;
}

const TEMPLATE_ACTIONS: TemplateActions = {
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
 * Handle legacy WebSocket events
 * @param data - WebSocket event data
 * @param user_id - Current user ID
 */
export const handleWebSocketEvent = (
  data: LegacyWebSocketEvent,
  user_id?: string | null,
): void => {
  switch (data.type) {
    // === Webhook Subscription Events (Legacy) ===
    case 'WebhookSubscriptionNew':
      if (data.data?.attributes) {
        dispatch(addWebhookSubscription(data.data.attributes as any));
      }
      break;
    case 'WebhookSubscriptionDelete':
      if (data.data) {
        dispatch(deleteWebhookSubscription(data.data as any));
      }
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
      if (data.data?.attributes) {
        dispatch(addModule(data.data.attributes as any));
      }
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
      if (data.data?.changes && data.data.ids?.[0]) {
        dispatch(
          updateModule({
            ...data.data.changes,
            id: data.data.ids[0],
          }),
        );
      }
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
      if (data.data) {
        dispatch(deleteModules(data.data as any));
      }
      break;
    case 'RouteConditionNew':
      if (data.data?.attributes) {
        dispatch(addRouteCondition(data.data.attributes as any));
      }
      break;
    case 'RouteConditionUpdate':
      if (data.data) {
        dispatch(updateRouteCondition(data.data as any));
      }
      break;
    case 'RouteConditionDelete':
      if (data.data) {
        dispatch(deleteRouteCondition(data.data as any));
      }
      break;

    // === Tool & Workflow Events (Legacy) ===
    case 'ToolUpdate':
      if (data.data?.changes && data.data.ids?.[0]) {
        dispatch(
          updateTool({
            ...data.data.changes,
            id: data.data.ids[0],
          }),
        );
      }
      break;
    case 'WorkflowDelete':
      if (data.data?.ids?.[0]) {
        dispatch(deleteFlow(data.data.ids[0]));
      }
      break;
    case 'WorkflowUpdate':
      if (data.data?.changes && data.data.ids?.[0]) {
        dispatch(
          updateFlow({
            ...data.data.changes,
            id: data.data.ids[0],
          }),
        );
      }
      break;
    case 'WorkflowNew':
      if (data.data?.attributes) {
        dispatch(addFlow(data.data.attributes as any));
      }
      break;

    // === Execution Events (Legacy) ===
    case 'ModuleExecutionUpdate':
      if (data.data) {
        dispatch(addOrUpdateModuleExecution({ ...data.data, timestamp: data.timestamp } as any));
      }
      break;
    case 'FlowExecutionNew':
      if (data.data?.attributes) {
        dispatch(addFlowExecution(data.data.attributes as any));
        dispatch(addWorkflowExecution(data.data.attributes as any));
      }
      break;
    case 'FlowExecutionUpdate':
      if (data.data?.ids?.[0] && data.data.changes) {
        dispatch(updateFlowExecution({ id: data.data.ids[0], ...data.data.changes } as any));
        const updatePayload = {
          id: data.data.ids[0],
          changes: {
            ...data.data.changes,
            workflow_id: data.data.changes.workflow_id as any,
          },
        };
        dispatch(updateWorkflowExecution(updatePayload as any));
      }
      break;

    // === Webhook Events (Legacy) ===
    case 'WebhookNew':
      if (data.data?.attributes) {
        dispatch(addWebhook(data.data.attributes as any));
      }
      break;
    case 'WebhookDelete':
      if (data.data?.ids?.[0]) {
        dispatch(deleteWebhook(data.data.ids[0]));
      }
      break;

    // === Subscription Events (Legacy) ===
    case 'SubscriptionNew':
      if (data.data?.attributes) {
        dispatch(addSubscription(data.data.attributes as any));
      }
      break;
    case 'SubscriptionUpdate':
      if (data.data?.ids?.[0] && data.data.changes) {
        dispatch(
          updateSubscription({
            id: data.data.ids[0],
            ...data.data.changes,
          } as any),
        );
      }
      break;
    case 'SubscriptionDelete':
      if (data.data?.ids?.[0]) {
        dispatch(deleteSubscription(data.data.ids[0]));
      }
      break;

    // === Template Events (Legacy - Complex multi-entity handler) ===
    case 'TemplateNew':
    case 'TemplateUpdate':
    case 'TemplateDelete':
    case 'TemplateVersionNew':
    case 'TemplateVersionUpdate':
    case 'TemplateVersionDelete': {
      const mode: TemplateMode = data.type.includes('Version') ? 'version' : 'template';
      const crud = data.type
        .replace(mode === 'version' ? 'TemplateVersion' : 'Template', '')
        .toLowerCase() as CrudOperation;
      const entity = (['flow', 'altaner', 'agent', 'form', 'gate'] as EntityType[]).find(
        (e) => !!data[`${e}_id`],
      );

      if (!entity || !data.data) {
        break;
      }

      const actionCreator = TEMPLATE_ACTIONS[mode][crud][entity];
      if (!actionCreator) {
        break;
      }

      const payload: Record<string, unknown> = {
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

      dispatch(actionCreator(payload));
      break;
    }

    // === File Events (Legacy - Code Editor related) ===
    case 'FileUpdate':
    case 'FileDelete':
    case 'FileCreate':
      // Set hasChanges to true when files are modified
      dispatch(setDiffChanges(true));
      switch (data.type) {
        case 'FileUpdate':
          // Handle file content updates from WebSocket
          if (data.data?.updates) {
            batch(() => {
              data.data!.updates!.forEach((update) => {
                dispatch(
                  updateFileContent({
                    path: update.file_name,
                    content: update.content,
                  }),
                );
              });
            });
          }
          break;
        case 'FileDelete':
          // Handle file deletion from WebSocket
          if (data.data?.file_name) {
            batch(() => {
              dispatch(deleteFile(data.data!.file_name!));
              dispatch(closeFile(data.data!.file_name!));
            });
          }
          break;
        case 'FileCreate':
          // Handle new file creation from WebSocket
          if (data.data?.file_name) {
            dispatch(
              setFileContent({
                path: data.data.file_name,
                content: '', // Initial empty content, will be populated when file is opened
              }),
            );
          }
          break;
      }
      break;

    // // === Thread Read Events (Legacy - Not migrated yet) ===
    // // TODO: Consider migrating to thread.read when ready
    // case 'ThreadRead':
    //   dispatch(changeThreadReadState(data.data));
    //   break;

    // // === Message Reaction Events (Legacy - Partially handled) ===
    // // Note: message.reaction.created is handled in messageHandlers.js
    // case 'MessageReactionNew':
    //   dispatch(addMessageReaction(data.data.attributes));
    //   break;
    // case 'MessageReactionDelete':
    //   // TODO: Implement message reaction deletion handler
    //   // dispatch((data.data.attributes));
    //   break;

    default:
      // Unknown event type - may be handled by dedicated handlers
      // console.log('Received unknown event type', data);
      break;
  }
};

