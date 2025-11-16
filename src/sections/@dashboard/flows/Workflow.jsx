import Stack from '@mui/material/Stack';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useLocation, useHistory, useParams } from 'react-router';
import { ReactFlowProvider } from 'reactflow';

import { dispatch, useSelector } from '@redux/store.ts';

import AssemblingWorkflow from './AssemblingWorkflow.jsx';
import FlowCanvas from './FlowCanvas.jsx';
import FlowCanvasToolbar from './FlowCanvasToolbar.jsx';
import ModuleMenu from './ModuleMenu.jsx';
import NewWorkflow from './NewWorkflow.jsx';
import CodeWorkflow from './CodeWorkflow.jsx';
import FloatingChatWindow from '../../../components/chat-widget/FloatingChatWindow.jsx';
import ModuleExecutionOverviewModal from '../../../components/flows/canvas/nodes/executions/ModuleExecutionOverviewModal.jsx';
import GlobalVarsMenu from '../../../components/flows/menuvars/GlobalVarsMenu.jsx';
import Iconify from '../../../components/iconify';
import IconRenderer from '../../../components/icons/IconRenderer.jsx';
import useCompactMode from '../../../hooks/useCompactMode';
import { CompactLayout } from '../../../layouts/dashboard/index.js';
import { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider';
import {
  selectFlow,
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
  setInitializedNodes,
} from '../../../redux/slices/flows';

const FlowProviderWrapped = memo((props) => (
  <ReactFlowProvider>
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flex: 1
    }}>
      <FlowCanvas
        id="flowcanvas"
        style={{
          width: '100%',
          height: '100%',
          flex: 1
        }}
        {...(props ?? {})}
      />
    </div>
  </ReactFlowProvider>
));

FlowProviderWrapped.displayName = 'FlowProviderWrapped';

const Workflow = ({
  id: propId,
  // top = 0,
  onGoBack = null,
  altanerComponentId = null,
  useCompactLayout = false,
  ...altanerProps
}) => {
  const history = useHistory();;
  const { id: routeId } = useParams();
  const ws = useHermesWebSocket();
  const { isCompact, toolbarRef } = useCompactMode(600);

  const id = propId || routeId;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' or 'code'
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);

  const mustCreateTrigger = useSelector(selectMustCreateTrigger);
  const mustCreateModuleAfterTriggers = useSelector(selectMustCreateModuleAfterTriggers);
  const initialized = useSelector(selectInitializedFlow);
  const isLoading = useSelector(selectIsLoadingFlow);
  const initializedNodes = useSelector(selectInitializedNodes);
  const flow = useSelector(selectFlowDetails);
  const fullFlow = useSelector(selectFlow);

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

  // Determine if this is a code flow
  const isCodeFlow = fullFlow?.meta_data?.is_code_flow === true;

  // Auto-switch to code view for code flows (only once)
  useEffect(() => {
    if (isCodeFlow && viewMode === 'canvas' && !hasAutoSwitched) {
      setViewMode('code');
      setHasAutoSwitched(true);
    }
  }, [isCodeFlow, viewMode, hasAutoSwitched]);

  // Reset auto-switch when navigating to a different flow
  useEffect(() => {
    setHasAutoSwitched(false);
    setViewMode('canvas');
  }, [id]);

  // When switching to canvas view, ensure nodes get initialized if they aren't already
  useEffect(() => {
    if (viewMode === 'canvas' && initialized && !initializedNodes) {
      // Give a small delay to allow the FlowLayoutedNodes component to initialize
      const timer = setTimeout(() => {
        if (!initializedNodes) {
          dispatch(setInitializedNodes());
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, initialized, initializedNodes]);

  if (!flow?.id && altanerComponentId && !isLoading) {
    return useCompactLayout ? (
      <CompactLayout noPadding overflowHidden>
        <NewWorkflow altanerComponentId={altanerComponentId} />
      </CompactLayout>
    ) : (
      <NewWorkflow altanerComponentId={altanerComponentId} />
    );
  }

  const workflowContent = (
    <>
      <Stack
        direction="row"
        height="100%"
        width="100%"
        sx={{
          overflow: 'hidden',
          position: 'relative',
          flex: 1,
          display: 'flex'
        }}
      >
        <div
          ref={toolbarRef}
          className="relative h-full w-full overflow-hidden flex-1"
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <FlowCanvasToolbar
            {...(altanerProps ?? {})}
            // top={top}
            onGoBack={effectiveOnGoBack}
            isCompact={isCompact}
            isCodeFlow={isCodeFlow}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <AssemblingWorkflow
            open={!initialized || (viewMode === 'canvas' && !initializedNodes)}
            message="Loading workflow data... Please wait..."
            icon="project_management"
          />
          {!!initialized && viewMode === 'canvas' && !!initializedNodes && <FlowProviderWrapped {...(altanerProps ?? {})} />}
          {!!initialized && viewMode === 'code' && <CodeWorkflow />}
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
    </>
  );

  return useCompactLayout ? (
    <CompactLayout noPadding overflowHidden>
      {workflowContent}
    </CompactLayout>
  ) : (
    workflowContent
  );
};

export default memo(Workflow);
