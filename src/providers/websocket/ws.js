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
  integrateRealTimeUpdates,
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
  // Activation lifecycle actions
  addActivationLifecycle,
  completeActivationLifecycle,
  discardActivationLifecycle,
  // Response lifecycle actions
  addResponseLifecycle,
  completeResponseLifecycle,
} from '../../redux/slices/room';
import { addTask, updateTask, removeTask } from '../../redux/slices/tasks';
import { dispatch } from '../../redux/store';
import { messagePartBatcher } from '../../utils/eventBatcher';

const SOUND_IN = new Audio(
  'https://api.altan.ai/platform/media/ba09b912-2681-489d-bfcf-91cc2f67aef2',
);

// Register handler for high-frequency streaming updates
// Only 'updated' events are batched - lifecycle events are processed immediately
messagePartBatcher.registerHandler('updated', (eventData) => {
  dispatch(updateMessagePart(eventData));
});

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
  // console.log('handleWebSocketEvent', data);
  switch (data.type) {
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
      console.log('AltanerComponentNew', data);
      dispatch(
        addAltanerComponent({
          altaner_id: data.data.altaner_id,
          attributes: data.data,
        }),
      );
      break;
    case 'AltanerComponentUpdate':
      console.log('AltanerComponentUpdate', data);
      dispatch(
        patchAltanerComponent({
          altaner_id: data.data.altaner_id,
          ids: [data.data.id],
          changes: data.data,
        }),
      );
      break;
    case 'AltanerComponentDelete':
      dispatch(
        deleteAltanerComponent({
          altaner_id: data.data.altaner_id,
          ids: [data.data.id],
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
      // New event format: data is directly in data.data
      const deploymentData = data.data;
      const deploymentId = deploymentData.id;
      const vercelDeploymentId = deploymentData.deployment_id;
      const interfaceId = deploymentData.interface_id;

      // If interface_id is not provided, we need to find it by searching all interfaces
      if (!interfaceId) {
        console.warn(
          'Interface ID not found in deployment update, searching existing deployments...',
        );
        // This will be handled by the Redux reducer with a special flag
        dispatch(
          updateInterfaceDeployment({
            id: deploymentId,
            interface_id: null, // Signal that we need to find it
            vercel_deployment_id: vercelDeploymentId,
            search_all_interfaces: true,
            status: deploymentData.status,
            url: deploymentData.url,
            commit_sha: deploymentData.commit_sha,
            meta_data: deploymentData.meta_data,
            interface_name: deploymentData.interface_name,
            date_creation: deploymentData.date_creation,
          }),
        );
      } else {
        dispatch(
          updateInterfaceDeployment({
            id: deploymentId,
            interface_id: interfaceId,
            vercel_deployment_id: vercelDeploymentId,
            status: deploymentData.status,
            url: deploymentData.url,
            commit_sha: deploymentData.commit_sha,
            meta_data: deploymentData.meta_data,
            interface_name: deploymentData.interface_name,
            date_creation: deploymentData.date_creation,
          }),
        );
      }

      // Show success notification for completed deployments
      if (deploymentData.status === 'COMPLETED') {
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
      console.log('CommitNew - Full data:', data);
      console.log('CommitNew - Attributes:', data.data.attributes);
      const commitPayload = {
        id: data.data.attributes.id,
        interface_id: data.data.attributes.interface_id,
        ...data.data.attributes,
      };
      console.log('CommitNew - Dispatching payload:', commitPayload);
      dispatch(addInterfaceCommit(commitPayload));
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
      const newTableName = data.table_name || data.data?.table_name;
      const newBaseId = data.base_id || data.data?.base_id;
      const newRecords = data.records || data.data?.records;

      if (newTableName && newBaseId && newRecords && Array.isArray(newRecords)) {
        // Dispatch a thunk to access state and integrate updates
        dispatch((dispatch, getState) => {
          const state = getState();
          const base = state.bases?.bases?.[newBaseId];
          const table = base?.tables?.items?.find(
            (t) => t.db_name === newTableName || t.name === newTableName,
          );

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
          const table = base?.tables?.items?.find(
            (t) => t.db_name === updateTableName || t.name === updateTableName,
          );

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
      dispatch(addAuthorizationRequest(data.data.attributes));
      break;
    case 'AuthorizationRequestUpdate':
      const { id, ...changes } = data.data;
      dispatch(
        updateAuthorizationRequest({
          ids: [id],
          changes: changes,
        }),
      );
      break;
    case 'RoomNew':
      dispatch(addGateRoom(data.data.attributes));
      break;
    case 'RoomUpdate':
      dispatch(roomUpdate(data.data));
      break;
    case 'RoomMemberJoined':
      console.log('RoomMemberJoined', data.data);
      const attrs = data.data.attributes;

      // Transform flat websocket structure to match expected nested member structure
      const memberData = {
        id: attrs.member_id,
        member_type: attrs.member_type,
      };

      // Add user, agent, or guest data based on member_type
      // Use the specific ID field if available, otherwise use member_id as fallback
      if (attrs.member_type === 'user') {
        memberData.user = {
          id: attrs.user_id || attrs.member_id,
          // Store member_name as fallback display name since websocket doesn't provide first_name/last_name
          first_name: attrs.member_name || '',
          last_name: '',
        };
      } else if (attrs.member_type === 'agent') {
        memberData.agent = {
          id: attrs.agent_id || attrs.member_id,
          name: attrs.member_name,
        };
      } else if (attrs.member_type === 'guest') {
        memberData.guest = {
          id: attrs.guest_id || attrs.member_id,
          first_name: attrs.member_name || '',
          last_name: '',
        };
      }

      dispatch(
        addMember({
          roomMember: {
            id: data.data.id,
            role: attrs.role,
            date_creation: attrs.date_creation,
            is_kicked: attrs.is_kicked,
            is_silenced: attrs.is_silenced,
            is_vblocked: attrs.is_vblocked,
            is_cagi_enabled: attrs.is_cagi_enabled,
            agent_interaction: attrs.agent_interaction,
            caller_id: attrs.caller_id,
            account_id: attrs.account_id,
            room_id: attrs.room_id,
            room_name: attrs.room_name,
            member: memberData,
          },
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
      const timestamp =
        agentEvent.event_extras?.timestamp ||
        agentEvent.extras?.timestamp ||
        agentEvent.timestamp ||
        eventData?.timestamp ||
        new Date().toISOString();

      // Handle activation and response lifecycle events
      if (eventType.startsWith('activation.') || eventType.startsWith('response.')) {
        // Activation lifecycle (before response starts)
        if (eventType.startsWith('activation.')) {
          // Add to activation lifecycle
          dispatch(
            addActivationLifecycle({
              response_id: eventData.response_id,
              agent_id: eventData.agent_id,
              thread_id: eventData.thread_id,
              event_type: eventType,
              event_data: eventData,
              timestamp,
            }),
          );

          // Complete activation lifecycle when scheduled or rescheduled
          if (['activation.scheduled', 'activation.rescheduled'].includes(eventType)) {
            dispatch(
              completeActivationLifecycle({
                response_id: eventData.response_id,
                thread_id: eventData.thread_id,
              }),
            );
          }

          // Discard activation when discarded
          if (eventType === 'activation.discarded') {
            dispatch(
              discardActivationLifecycle({
                response_id: eventData.response_id,
                thread_id: eventData.thread_id,
              }),
            );
          }
        }

        // Response lifecycle (after response starts)
        if (eventType.startsWith('response.')) {
          // Add to response lifecycle
          dispatch(
            addResponseLifecycle({
              response_id: eventData.response_id,
              agent_id: eventData.agent_id,
              thread_id: eventData.thread_id,
              event_type: eventType,
              event_data: eventData,
              timestamp,
            }),
          );

          // Complete response lifecycle on completion events
          if (
            [
              'response.completed',
              'response.failed',
              'response.empty',
              'response.stopped',
              'response.interrupted',
              'response.suspended',
              'response.requeued',
            ].includes(eventType)
          ) {
            dispatch(
              completeResponseLifecycle({
                response_id: eventData.response_id,
                thread_id: eventData.thread_id,
                message_id: eventData.message_id,
                status: eventType.replace('response.', ''),
              }),
            );
          }
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
            dispatch(
              updateMessageStreamingState({
                messageId: eventData.message_id,
                isStreaming: false,
              }),
            );
          }
          break;

        case 'response.empty':
          dispatch(deleteRunningResponse(eventData));
          if (eventData.message_id) {
            batch(() => {
              dispatch(
                updateMessageStreamingState({
                  messageId: eventData.message_id,
                  isStreaming: false,
                }),
              );

              // Mark message as empty response
              dispatch(
                addMessage({
                  id: eventData.message_id,
                  thread_id: eventData.thread_id,
                  meta_data: {
                    is_empty: true,
                  },
                }),
              );
            });
          }
          break;

        case 'response.failed':
          dispatch(deleteRunningResponse(eventData));
          if (eventData.message_id) {
            batch(() => {
              dispatch(
                updateMessageStreamingState({
                  messageId: eventData.message_id,
                  isStreaming: false,
                }),
              );

              // Update message meta_data with error information
              dispatch(
                addMessage({
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
                }),
              );

              // Add error message part to display the error
              // Use a deterministic ID so multiple errors for the same message replace each other
              const errorPartId = `${eventData.message_id}-error`;
              dispatch(
                addMessagePart({
                  id: errorPartId,
                  message_id: eventData.message_id,
                  thread_id: eventData.thread_id,
                  type: 'error',
                  error_code: eventData.error_code,
                  error_message: eventData.error_message,
                  error_type: eventData.error_type,
                  failed_in: eventData.failed_in,
                  retryable: eventData.retryable,
                  total_attempts: eventData.total_attempts,
                  order: 999, // Put error at the end
                  is_done: true,
                }),
              );
            });
          }
          break;

        case 'message_part.added':
          // Process immediately - lifecycle event
          batch(() => {
            dispatch(addMessagePart(eventData));
          });
          break;
        case 'message_part.updated':
          // Batch for performance - high frequency event
          messagePartBatcher.enqueue('updated', eventData);
          break;
        case 'message_part.completed':
          // Process immediately - critical completion event
          // Flush any pending updates first to ensure correct order
          messagePartBatcher.flush();
          batch(() => {
            dispatch(markMessagePartDone(eventData));
          });
          break;
        case 'MessagePartDeleted':
          // Process immediately - lifecycle event
          batch(() => {
            dispatch(deleteMessagePart(eventData));
          });
          break;

        case 'activation.failed':
          // Check if it's a not_enough_credits error
          if (eventData.error_type === 'not_enough_credits') {
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
                thread_id: eventData.thread_id,
                member_id: 'system',
                date_creation: getSimulatedDate(),
                id: 'credits-not-enough',
              }),
            );
          }
          break;

        default:
          if (!eventType.startsWith('activation.') && !eventType.startsWith('response.')) {
            console.log('Unknown AGENT_RESPONSE event:', eventType, agentEvent);
          } else {
            console.log('Unknown AGENT_RESPONSE event ( not activation or response ):', eventType);
          }
      }
      break;
    case 'RoomMemberUpdate':
      dispatch(roomMemberUpdate(data.data));
      break;
    case 'ThreadNew':
      console.log('ThreadNew', data);
      dispatch(addThread(data.data.attributes));
      break;
    case 'ThreadOpened':
      const thread = data.data.attributes;
      dispatch(addThread(thread));
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
    case 'TASK_EVENT':
      console.log('TASK_EVENT', data);

      const taskEvent = data.data?.task_event;
      if (!taskEvent) {
        console.error('TASK_EVENT missing task_event:', data);
        break;
      }

      const taskEventType = taskEvent.event_type;
      const taskEventData = taskEvent.data;

      if (!taskEventType || !taskEventData) {
        console.error('TASK_EVENT missing event_type or data:', data);
        break;
      }

      switch (taskEventType) {
        case 'task.created':
          dispatch(
            addTask({
              threadId: taskEventData.mainthread_id,
              task: {
                id: taskEventData.task_id,
                mainthread_id: taskEventData.mainthread_id,
                room_id: taskEventData.room_id,
                task_name: taskEventData.task_name,
                task_description: taskEventData.task_description,
                status: taskEventData.status,
                priority: taskEventData.priority,
                assigned_agent: taskEventData.assigned_agent,
                assigned_agent_name: taskEventData.assigned_agent_name,
                subthread_id: taskEventData.subthread_id,
                dependencies: taskEventData.dependencies,
                summary: taskEventData.summary,
                created_at: taskEventData.created_at,
                started_at: taskEventData.started_at,
                finished_at: taskEventData.finished_at,
                updated_at: taskEventData.updated_at,
              },
            }),
          );
          break;
        case 'task.updated':
          // eslint-disable-next-line no-console
          console.log('🔄 task.updated:', taskEventData);
          dispatch(
            updateTask({
              threadId: taskEventData.mainthread_id || taskEventData.room_id,
              taskId: taskEventData.task_id,
              updates: {
                id: taskEventData.task_id,
                status: taskEventData.status,
                task_name: taskEventData.task_name,
                task_description: taskEventData.task_description,
                assigned_agent: taskEventData.assigned_agent,
                assigned_agent_name: taskEventData.assigned_agent_name,
                subthread_id: taskEventData.subthread_id,
                priority: taskEventData.priority,
                dependencies: taskEventData.dependencies,
                summary: taskEventData.summary,
                created_at: taskEventData.created_at,
                started_at: taskEventData.started_at,
                finished_at: taskEventData.finished_at,
                updated_at: taskEventData.updated_at,
              },
            }),
          );
          break;
        case 'task.deleted':
          // eslint-disable-next-line no-console
          console.log('🗑️ task.deleted:', taskEventData);
          dispatch(
            removeTask({
              threadId: taskEventData.mainthread_id || taskEventData.room_id,
              taskId: taskEventData.task_id,
            }),
          );
          break;
        case 'task.completed':
          // eslint-disable-next-line no-console
          console.log('✅ task.completed:', taskEventData);
          dispatch(
            updateTask({
              threadId: taskEventData.mainthread_id || taskEventData.room_id,
              taskId: taskEventData.task_id,
              updates: {
                status: 'completed',
                task_name: taskEventData.task_name,
                task_description: taskEventData.task_description,
                assigned_agent: taskEventData.assigned_agent,
                assigned_agent_name: taskEventData.assigned_agent_name,
                subthread_id: taskEventData.subthread_id,
                priority: taskEventData.priority,
                dependencies: taskEventData.dependencies,
                summary: taskEventData.summary,
                created_at: taskEventData.created_at,
                started_at: taskEventData.started_at,
                finished_at: taskEventData.finished_at,
                updated_at: taskEventData.updated_at || new Date().toISOString(),
              },
            }),
          );

          // Send browser notification
          dispatch(
            addNotification({
              id: `task-completed-${taskEventData.task_id}-${Date.now()}`,
              status: 'unopened',
              notification: {
                type: 'system',
                title: 'Task Completed',
                body: `✅ "${taskEventData.task_name}" has been completed!`,
                message: `The task "${taskEventData.task_name}" has been marked as completed.`,
                date_creation: new Date().toISOString(),
                meta_data: {
                  data: {
                    category: 'task_completed',
                    task: {
                      id: taskEventData.task_id,
                      name: taskEventData.task_name,
                      room_id: taskEventData.room_id,
                      mainthread_id: taskEventData.mainthread_id,
                    },
                  },
                  avatar_url: '/logos/logoBlack.png',
                },
              },
            }),
          );
          break;
        default:
          console.log('Unknown TASK_EVENT type:', taskEventType, taskEvent);
      }
      break;
    case 'MESSAGE':
      // console.log('MESSAGE', data);
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
    default:
      // console.log('Received unknown event type', data);
      break;
  }
};
