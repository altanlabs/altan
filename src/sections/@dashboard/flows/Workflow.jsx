import Stack from '@mui/material/Stack';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useLocation, useHistory, useParams } from 'react-router';
import { ReactFlowProvider } from 'reactflow';

import { dispatch, useSelector } from '@redux/store';

import AssemblingWorkflow from './AssemblingWorkflow.jsx';
import FlowCanvas from './FlowCanvas.jsx';
import FlowCanvasToolbar from './FlowCanvasToolbar.jsx';
import ModuleMenu from './ModuleMenu.jsx';
import NewWorkflow from './NewWorkflow.jsx';
import FloatingChatWindow from '../../../components/chat-widget/FloatingChatWindow.jsx';
import ModuleExecutionOverviewModal from '../../../components/flows/canvas/nodes/executions/ModuleExecutionOverviewModal.jsx';
import GlobalVarsMenu from '../../../components/flows/menuvars/GlobalVarsMenu.jsx';
import Iconify from '../../../components/iconify';
import IconRenderer from '../../../components/icons/IconRenderer.jsx';
import useCompactMode from '../../../hooks/useCompactMode';
import { CompactLayout } from '../../../layouts/dashboard/index.js';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import {
  selectFlowDetails,
  selectInitializedFlow,
  selectIsLoadingFlow,
  selectInitializedNodes,
  addNewModule,
  clearCurrentFlow,
  getFlow,
  selectMustCreateTrigger,
  selectMustCreateModuleAfterTriggers,
  createModulesAfterTriggers,
} from '../../../redux/slices/flows';

const FlowProviderWrapped = memo((props) => (
  <ReactFlowProvider>
    <FlowCanvas
      id="flowcanvas"
      {...(props ?? {})}
    />
  </ReactFlowProvider>
));

FlowProviderWrapped.displayName = 'FlowProviderWrapped';

const Workflow = ({
  id: propId,
  // top = 0,
  onGoBack = null,
  altanerComponentId = null,
  ...altanerProps
}) => {
  const history = useHistory();;
  const { id: routeId } = useParams();
  const ws = useWebSocket();
  const { isCompact, toolbarRef } = useCompactMode(600);

  const id = propId || routeId;
  const [isChatOpen, setIsChatOpen] = useState(false);

  const mustCreateTrigger = useSelector(selectMustCreateTrigger);
  const mustCreateModuleAfterTriggers = useSelector(selectMustCreateModuleAfterTriggers);
  const initialized = useSelector(selectInitializedFlow);
  const isLoading = useSelector(selectIsLoadingFlow);
  const initializedNodes = useSelector(selectInitializedNodes);
  const flow = useSelector(selectFlowDetails);

  useEffect(() => {
    if (id) {
      dispatch(getFlow(id)).catch(() => history.push('/flows'));
    }
  }, [id]);

  useEffect(() => {
    if (!!flow && (!!mustCreateTrigger || !flow.entry_module_id)) {
      dispatch(addNewModule({}));
    }
  }, [mustCreateTrigger]);

  useEffect(() => {
    if (!!mustCreateModuleAfterTriggers) {
      dispatch(createModulesAfterTriggers());
    }
  }, [mustCreateModuleAfterTriggers]);

  useEffect(() => {
    if (!!id && ws?.isOpen) {
      ws.subscribe(`flow:${id}`);
      ws.subscribe(`flow:${id}:execution:*`, null, 'p');
    }
  }, [ws?.isOpen, id]);

  useEffect(() => {
    return () => {
      if (!!ws) {
        ws.unsubscribe(`flow:${id}`);
        ws.unsubscribe(`flow:${id}:execution:*`, null, 'p');
      }
      dispatch(clearCurrentFlow());
    };
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const goBackQuery = queryParams.get('goBack');

  let effectiveOnGoBack = onGoBack; // 'onGoBack' is the destructured prop from Workflow's arguments

  if (goBackQuery === 'true') {
    effectiveOnGoBack = () => history.push('/flows');
  }

  const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);

  if (!flow?.id && altanerComponentId && !isLoading) {
    return <NewWorkflow altanerComponentId={altanerComponentId} />;
  }

  return (
    <CompactLayout noPadding>
      <Stack
        direction="row"
        height="100%"
        width="100%"
        className="overscroll-x-none overflow-hidden relative"
      >
        <div
          ref={toolbarRef}
          className="relative h-full w-full overflow-hidden"
        >
          <FlowCanvasToolbar
            {...(altanerProps ?? {})}
            // top={top}
            onGoBack={effectiveOnGoBack}
            isCompact={isCompact}
          />
          {/* Toggle Button */}
          <button
            className="absolute bottom-3 right-3 h-[40] w-[40] flex items-center z-[99] transition transition-tranform hover:scale-110"
            onClick={toggleChat}
          >
            {isChatOpen ? (
              <Iconify icon="mdi:close" />
            ) : (
              <IconRenderer
                icon="@lottie:chat:hover"
                size={38}
              />
            )}
          </button>
        </div>
        <ModuleMenu />
        <div className="absolute inset-0 overflow-hidden">
          <AssemblingWorkflow
            open={!initialized || !initializedNodes}
            message="Loading workflow data... Please wait..."
            icon="project_management"
          />
          {!!initialized && <FlowProviderWrapped {...(altanerProps ?? {})} />}
        </div>
      </Stack>

      {/* Floating Chat Window */}
      {isChatOpen && (
        <FloatingChatWindow
          id={`workflow_${flow?.id}`}
          accountId={flow?.account_id}
          name={`${flow?.name} Room`}
          onClose={closeChat}
          offsetX={-14}
        />
      )}
      <GlobalVarsMenu />
      <ModuleExecutionOverviewModal />
    </CompactLayout>
  );
};

export default memo(Workflow);
