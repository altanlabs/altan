// TODO: move all redux here

import { batch } from 'react-redux';

import {
  addAltaner,
  updateAltaner,
  deleteAltaner,
  addAltanerTemplate,
  updateAltanerTemplate,
  deleteAltanerTemplate,
  addAltanerTemplateVersion,
  updateAltanerTemplateVersion,
  deleteAltanerTemplateVersion,
  addAltanerComponent,
  patchAltanerComponent,
  deleteAltanerComponent,
} from '../../redux/slices/altaners';
import {
  addBase,
  updateBase,
  deleteBase,
  addTable,
  updateTable,
  deleteTable,
  addField,
  updateField,
  deleteField,
  integrateRealTimeUpdates,
  fetchTables,
  fetchSchemas,
} from '../../redux/slices/bases';
import {
  setFileContent,
  updateFileContent,
  closeFile,
  setDiffChanges,
  deleteFile,
} from '../../redux/slices/codeEditor';
import { addConnection, deleteConnection, updateConnection } from '../../redux/slices/connections';
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
import { addGateRoom } from '../../redux/slices/gate';
import {
  addAccountAltaner,
  updateAccountAltaner,
  deleteAccountAltaner,
  addWebhook,
  deleteWebhook,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  addInterface,
  updateInterface,
  deleteInterface,
  addInterfaceDeployment,
  updateInterfaceDeployment,
  deleteInterfaceDeployment,
  addWorkflowExecution,
  updateWorkflowExecution,
  addInterfaceCommit,
  updateInterfaceCommit,
  deleteInterfaceCommit,
} from '../../redux/slices/general';
import { addNotification } from '../../redux/slices/notifications';
import {
  addMessage,
  removeMessage,
  addMessageAttachment,
  addMessageReaction,
  addMember,
  roomMemberUpdate,
  roomUpdate,
  addThread,
  threadUpdate,
  changeThreadReadState,
  addMessageExecution,
  updateMessageExecution,
  removeThread,
  addRunningResponse,
  deleteRunningResponse,
  updateAuthorizationRequest,
  addAuthorizationRequest,
  // Message parts actions
  addMessagePart,
  updateMessagePart,
  markMessagePartDone,
  deleteMessagePart,
  updateMessageStreamingState,
  // Response lifecycle actions
  addResponseLifecycle,
  completeResponseLifecycle,
} from '../../redux/slices/room';
import {
  addPlan,
  updatePlan,
  deletePlan,
  addPlanGroup,
  updatePlanGroup,
  deletePlanGroup,
  // Note: There's no specific reducer for SubscriptionPlanBilling in the current slice
} from '../../redux/slices/subscriptions';
import { addTask, updateTask, removeTask } from '../../redux/slices/tasks';
import { dispatch } from '../../redux/store';

const SOUND_IN = new Audio(
  'https://api.altan.ai/platform/media/ba09b912-2681-489d-bfcf-91cc2f67aef2',
);

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

export const handleWebSocketEvent = async (data, user_id) => {
  console.log('handleWebSocketEvent', data);
  switch (data.type) {
    case 'SchemaUpdate':
      // Handle schema updates with targeted refetching
      const { base_id, path } = data.data || {};

      // Dispatch targeted refetch based on the path
      try {
        if (path.startsWith('columns/')) {
          dispatch(fetchTables(base_id, { include_columns: true, include_relationships: true }));
        } else if (path.startsWith('tables/')) {
          dispatch(fetchTables(base_id, { include_columns: true, include_relationships: true }));
        } else if (path.startsWith('schemas/')) {
          dispatch(fetchSchemas(base_id));
        } else if (path.startsWith('policies/')) {
          dispatch(fetchTables(base_id, { include_columns: true, include_relationships: true }));
        } else {
          dispatch(fetchSchemas(base_id));
          dispatch(fetchTables(base_id, { include_columns: true, include_relationships: true }));
        }
      } catch (error) {
        console.error('❌ SchemaUpdate: Error during refetch', error);
      }

      break;
    case 'NotificationNew':
      dispatch(addNotification(data.data.attributes));
      break;
    case 'WebhookSubscriptionNew':
      dispatch(addWebhookSubscription(data.data.attributes));
      break;
    case 'WebhookSubscriptionDelete':
      dispatch(deleteWebhookSubscription(data.data));
      break;
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
    case 'ConnectionNew':
      dispatch(addConnection(data.data.attributes));
      break;
    case 'ConnectionUpdate':
      dispatch(updateConnection({ id: data.data.ids[0], ...data.data.changes }));
      break;
    case 'ConnectionDelete':
      dispatch(deleteConnection(data));
      break;
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
    case 'WebhookNew':
      dispatch(addWebhook(data.data.attributes));
      break;
    case 'WebhookDelete':
      dispatch(deleteWebhook(data.data.ids[0]));
      break;
    case 'AltanerNew':
      dispatch(addAccountAltaner(data.data.attributes));
      dispatch(addAltaner(data.data.attributes));
      break;
    case 'AltanerUpdate':
      dispatch(updateAccountAltaner(data.data));
      dispatch(updateAltaner({ id: data.data.ids[0], ...data.data.changes }));
      break;
    case 'AltanerDelete':
      dispatch(deleteAccountAltaner(data.data.ids[0]));
      dispatch(deleteAltaner(data.data.ids[0]));
      break;
    case 'AltanerComponentNew':
      dispatch(
        addAltanerComponent({
          altaner_id: data.data.attributes.altaner_id,
          attributes: data.data.attributes,
        }),
      );
      break;
    case 'AltanerComponentUpdate':
      dispatch(
        patchAltanerComponent({
          altaner_id: data.altaner_id,
          ids: data.data.ids,
          changes: data.data.changes,
        }),
      );
      break;
    case 'AltanerComponentDelete':
      dispatch(
        deleteAltanerComponent({
          altaner_id: data.altaner_id,
          ids: data.data.ids,
        }),
      );
      break;
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
    case 'SubscriptionPlanNew':
      dispatch(addPlan(data.data.attributes));
      break;
    case 'SubscriptionPlanUpdate':
      dispatch(
        updatePlan({
          id: data.data.ids[0],
          ...data.data.changes,
        }),
      );
      break;
    case 'SubscriptionPlanDelete':
      dispatch(deletePlan(data.data.ids[0]));
      break;
    case 'SubscriptionPlanGroupNew':
      dispatch(addPlanGroup(data.data.attributes));
      break;
    case 'SubscriptionPlanGroupUpdate':
      dispatch(
        updatePlanGroup({
          id: data.data.ids[0],
          ...data.data.changes,
        }),
      );
      break;
    case 'SubscriptionPlanGroupDelete':
      dispatch(deletePlanGroup(data.data.ids[0]));
      break;
    case 'SubscriptionPlanBilling':
      break;
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
    case 'TableNew':
      const tableBaseId = data.base_id || data.data.base_id || data.data.attributes.base_id;
      dispatch(
        addTable({
          baseId: tableBaseId,
          table: data.data.attributes,
        }),
      );
      break;
    case 'TableUpdate':
      dispatch(
        updateTable({
          baseId: data.base_id,
          tableId: data.data.ids[0],
          changes: data.data.changes,
        }),
      );
      break;
    case 'TableDelete':
      const deleteTableBaseId = data.base_id || data.data.base_id || data.data.attributes.base_id;
      const deleteTableId = data.data.ids ? data.data.ids[0] : data.data.id;
      dispatch(
        deleteTable({
          baseId: deleteTableBaseId,
          tableId: deleteTableId,
        }),
      );
      break;
    case 'FieldNew':
      const fieldBaseId = data.base_id || data.data.base_id || data.data.attributes.base_id;
      const fieldTableId = data.table_id || data.data.table_id || data.data.attributes.table_id;
      dispatch(
        addField({
          baseId: fieldBaseId,
          tableId: fieldTableId,
          field: data.data.attributes,
        }),
      );
      break;
    case 'FieldUpdate':
      dispatch(
        updateField({
          tableId: data.table_id,
          fieldId: data.data.ids[0],
          changes: data.data.changes,
        }),
      );
      break;
    case 'FieldDelete':
      dispatch(
        deleteField({
          tableId: data.table_id,
          fieldId: data.data.ids[0],
        }),
      );
      break;
    case 'InterfaceNew':
      dispatch(addInterface(data.data.attributes));
      break;
    case 'InterfaceUpdate':
      dispatch(
        updateInterface({
          id: data.data.ids[0],
          ...data.data.changes,
        }),
      );
      break;
    case 'InterfaceDelete':
      dispatch(deleteInterface(data.data.ids[0]));
      break;
    case 'DeploymentNew':
      dispatch(
        addInterfaceDeployment({
          id: data.data.attributes.id,
          interface_id: data.data.attributes.interface_id,
          ...data.data.attributes,
        }),
      );
      break;
    case 'DeploymentUpdate':
      // Try to find deployment by both possible ID formats
      const deploymentId = data.data.ids[0];
      const vercelDeploymentId = data.data.changes.meta_data?.deployment_info?.id;

      // Get interface_id from changes, or try to find it from existing deployment
      const interfaceId = data.data.changes.interface_id;

      // If interface_id is not in changes, we need to find it by searching all interfaces
      if (!interfaceId) {
        console.log('Interface ID not found in changes, searching existing deployments...');
        // This will be handled by the Redux reducer with a special flag
        dispatch(
          updateInterfaceDeployment({
            id: deploymentId,
            interface_id: null, // Signal that we need to find it
            vercel_deployment_id: vercelDeploymentId,
            search_all_interfaces: true,
            ...data.data.changes,
          }),
        );
      } else {
        dispatch(
          updateInterfaceDeployment({
            id: deploymentId,
            interface_id: interfaceId,
            vercel_deployment_id: vercelDeploymentId,
            ...data.data.changes,
          }),
        );
      }

      // Show success notification for completed deployments
      if (data.data.changes.status === 'COMPLETED') {
        // Use a timeout to ensure the notification is shown after state update
        setTimeout(() => {
          const event = new CustomEvent('deployment-completed', {
            detail: { message: 'Deployment completed successfully! 🚀' },
          });
          window.dispatchEvent(event);
        }, 100);
      }
      break;
    case 'DeploymentDelete':
      dispatch(deleteInterfaceDeployment(data.data.ids[0]));
      break;
    case 'CommitNew':
      dispatch(
        addInterfaceCommit({
          id: data.data.attributes.id,
          interface_id: data.data.attributes.interface_id,
          ...data.data.attributes,
        }),
      );
      break;
    case 'CommitUpdate':
      dispatch(
        updateInterfaceCommit({
          id: data.data.ids[0],
          interface_id: data.data.changes.interface_id,
          ...data.data.changes,
        }),
      );
      break;
    case 'CommitDelete':
      dispatch(deleteInterfaceCommit(data.data.ids[0]));
      break;
    case 'RecordsNew':
      console.log('RecordsNew WS', data);
      const newTableName = data.table_name || data.data?.table_name;
      const newBaseId = data.base_id || data.data?.base_id;
      const newRecords = data.records || data.data?.records;

      if (newTableName && newBaseId && newRecords && Array.isArray(newRecords)) {
        // Dispatch a thunk to access state and integrate updates
        dispatch((dispatch, getState) => {
          const state = getState();
          const base = state.bases?.bases?.[newBaseId];
          const table = base?.tables?.items?.find(t => t.db_name === newTableName || t.name === newTableName);

          if (table?.id) {
            dispatch(
              integrateRealTimeUpdates({
                tableId: table.id,
                additions: newRecords,
              }),
            );
          } else {
            console.warn('Could not find table ID for:', { newTableName, newBaseId });
          }
        });
      }
      break;
    case 'RecordsUpdate':
      const updateTableName = data.table_name || data.data?.table_name;
      const updateBaseId = data.base_id || data.data?.base_id;
      const updateRecords = data.records || data.data?.records;

      if (updateTableName && updateBaseId && updateRecords && Array.isArray(updateRecords)) {
        // Dispatch a thunk to access state and integrate updates
        dispatch((dispatch, getState) => {
          const state = getState();
          const base = state.bases?.bases?.[updateBaseId];
          const table = base?.tables?.items?.find(t => t.db_name === updateTableName || t.name === updateTableName);

          if (table?.id) {
            dispatch(
              integrateRealTimeUpdates({
                tableId: table.id,
                updates: updateRecords,
              }),
            );
          }
        });
      }
      break;
    case 'RecordsDelete':
      const deleteTableName = data.table_name || data.data?.table_name;
      const deleteBaseId = data.base_id || data.data?.base_id;
      const deleteIds = data.ids || data.data?.ids;

      if (deleteTableName && deleteBaseId && deleteIds && Array.isArray(deleteIds)) {
        // Dispatch a thunk to access state and integrate updates
        dispatch((dispatch, getState) => {
          const state = getState();
          const base = state.bases?.bases?.[deleteBaseId];
          const table = base?.tables?.items?.find(t => t.db_name === deleteTableName || t.name === deleteTableName);

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
    case 'AuthorizationRequestNew':
      console.log('AuthorizationRequestNew', data.data);
      dispatch(addAuthorizationRequest(data.data.attributes));
      break;
    case 'AuthorizationRequestUpdate':
      const { id, ...changes } = data.data;
      dispatch(updateAuthorizationRequest({
        ids: [id],
        changes: changes,
      }));
      break;
    case 'RoomNew':
      dispatch(addGateRoom(data.data.attributes));
      break;
    case 'RoomUpdate':
      dispatch(roomUpdate(data.data));
      break;
    case 'RoomMemberJoined':
      dispatch(
        addMember({
          roomMember: data.data.attributes,
          currentUserId: user_id,
        }),
      );
      break;

    case 'AGENT_RESPONSE':
      // Handle different event structures:
      // 1. agent_event at root level (e.g., activation.acknowledged)
      // 2. agent_event nested under data (e.g., response.started, response.completed)
      const agentEvent = data.agent_event || data.data?.agent_event;
      if (!agentEvent) {
        console.error('AGENT_RESPONSE missing agent_event:', data);
        break;
      }

      // Use event_data if available, otherwise use data directly
      const eventData = agentEvent.event_data || agentEvent.data;
      const eventType = agentEvent.event_type;

      // Try multiple timestamp sources in order of preference
      const timestamp = agentEvent.event_extras?.timestamp ||
                       agentEvent.extras?.timestamp ||
                       agentEvent.timestamp ||
                       eventData?.timestamp ||
                       new Date().toISOString();

      if (!eventType) {
        console.error('[AGENT_RESPONSE] missing event_type:', data);
        break;
      }

      // Handle activation and response lifecycle events
      if (eventType.startsWith('activation.') || eventType.startsWith('response.')) {
        console.log('[AGENT_RESPONSE] Event:', eventType, data);

        // console.log('[AGENT_RESPONSE] Lifecycle:', eventType, eventData, timestamp);
        dispatch(addResponseLifecycle({
          response_id: eventData.response_id,
          agent_id: eventData.agent_id,
          thread_id: eventData.thread_id,
          event_type: eventType,
          event_data: eventData,
          timestamp,
        }));

        // Handle response completion events
        if (['response.completed', 'response.failed', 'response.empty'].includes(eventType)) {
          dispatch(completeResponseLifecycle({
            response_id: eventData.response_id,
            thread_id: eventData.thread_id,
          }));
        }
      }

      // Handle specific events
      switch (eventType) {
        case 'response.started':
          const messageData = {
            id: eventData.message_id,
            thread_id: eventData.thread_id,
            member_id: eventData.room_member_id,
            date_creation: timestamp,
            text: '',
            is_streaming: true,
          };
          dispatch(addMessage(messageData));
          dispatch(addRunningResponse(eventData));
          break;

        case 'response.completed':
          dispatch(deleteRunningResponse(eventData));
          if (eventData.message_id) {
            dispatch(updateMessageStreamingState({
              messageId: eventData.message_id,
              isStreaming: false,
            }));
          }
          break;

        case 'response.empty':
          dispatch(deleteRunningResponse(eventData));
          if (eventData.message_id) {
            batch(() => {
              dispatch(updateMessageStreamingState({
                messageId: eventData.message_id,
                isStreaming: false,
              }));

              // Mark message as empty response
              dispatch(addMessage({
                id: eventData.message_id,
                thread_id: eventData.thread_id,
                meta_data: {
                  is_empty: true,
                },
              }));
            });
          }
          break;

        case 'response.failed':
          dispatch(deleteRunningResponse(eventData));
          if (eventData.message_id) {
            batch(() => {
              dispatch(updateMessageStreamingState({
                messageId: eventData.message_id,
                isStreaming: false,
              }));

              // Update message meta_data with error information
              dispatch(addMessage({
                id: eventData.message_id,
                thread_id: eventData.thread_id,
                meta_data: {
                  error_code: eventData.error_code,
                  error_message: eventData.error_message,
                  error_type: eventData.error_type,
                  failed_in: eventData.failed_in,
                  retryable: eventData.retryable,
                  total_attempts: eventData.total_attempts,
                },
              }));

              // Add error message part to display the error
              dispatch(addMessagePart({
                message_id: eventData.message_id,
                type: 'error',
                error_code: eventData.error_code,
                error_message: eventData.error_message,
                error_type: eventData.error_type,
                failed_in: eventData.failed_in,
                retryable: eventData.retryable,
                total_attempts: eventData.total_attempts,
                order: 999, // Put error at the end
                is_done: true,
              }));
            });
          }
          break;

        case 'MessagePartAdded':
          dispatch(addMessagePart(eventData));
          break;
        case 'MessagePartUpdated':
          dispatch(updateMessagePart(eventData));
          break;
        case 'MessagePartDone':
          dispatch(markMessagePartDone(eventData));
          break;
        case 'MessagePartDeleted':
          dispatch(deleteMessagePart(eventData));
          break;

        default:
          if (!eventType.startsWith('activation.') && !eventType.startsWith('response.')) {
            console.log('Unknown AGENT_RESPONSE event:', eventType, agentEvent);
          }
      }
      break;
    case 'RoomMemberUpdate':
      dispatch(roomMemberUpdate(data.data));
      break;
    case 'ThreadOpened':
      const thread = data.data.attributes;
      dispatch(addThread(thread));
      // dispatch(createTab({
      //   threadId: thread.id,
      //   threadName: thread.name,
      //   isMainThread: false,
      // }));
      break;
    case 'ThreadUpdate':
      dispatch(threadUpdate(data.data));
      break;
    case 'ThreadDelete':
      dispatch(removeThread(data.data));
      break;
    case 'ThreadRead':
      dispatch(changeThreadReadState(data.data));
      break;
    case 'ThreadTaskNew':
      dispatch(
        addTask({
          threadId: data.data.mainthread_id,
          task: data.data,
        }),
      );
      break;
    case 'ThreadTaskUpdate':
      // eslint-disable-next-line no-console
      console.log('🔄 ThreadTaskUpdate:', data);
      dispatch(
        updateTask({
          threadId: data.data.mainthread_id,
          taskId: data.data.id,
          updates: data.data,
        }),
      );
      break;
    case 'ThreadTaskDelete':
      // eslint-disable-next-line no-console
      console.log('🗑️ ThreadTaskDelete:', data);
      dispatch(
        removeTask({
          threadId: data.data.mainthread_id,
          taskId: data.data.id,
        }),
      );
      break;
    case 'MESSAGE':
      console.log('MESSAGE', data);
      dispatch(addMessage(data.data.attributes));
      break;
    case 'MessageNew':
      dispatch(addMessage(data.data.attributes));
      break;
    case 'MessageDelete':
      dispatch(removeMessage(data.data));
      break;
    case 'MessageReactionNew':
      dispatch(addMessageReaction(data.data.attributes));
      break;
    case 'MessageReactionDelete':
      // dispatch((data.data.attributes));
      break;
    case 'MessageMediaAdded':
      dispatch(addMessageAttachment(data.data.attributes));
      break;
    case 'TaskStarted':
      // console.log('TaskStarted:', data);
      dispatch(addMessageExecution(data.data.attributes));
      break;
    case 'TaskUpdate':
      // console.log('TaskUpdate:', data);
      dispatch(updateMessageExecution(data.data));
      break;
    case 'CreditsNotEnough':
      function getSimulatedDate() {
        const date = new Date();
        // Format the date in ISO format without the trailing Z, and extend milliseconds to microseconds by appending "000"
        const isoString = date.toISOString().slice(0, -1); // remove "Z"
        const splitTime = isoString.split('.');
        const milliseconds = splitTime[1] || '000';
        // Simulated microseconds by appending "000" to the milliseconds
        const microseconds = milliseconds.padEnd(6, '0');
        return `${splitTime[0]}.${microseconds}`;
      }

      dispatch(
        addMessage({
          text: '[no_credits](no_credits/no_credits)',
          thread_id: data.data.thread_id,
          member_id: 'system',
          date_creation: getSimulatedDate(),
          id: 'credits-not-enough',
        }),
      );
      break;
    default:
      // console.log('Received unknown event type', data);
      break;
  }
};
