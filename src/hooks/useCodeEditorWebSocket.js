import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { handleFileUpdate, fetchFileTree } from '../redux/slices/codeEditor';

export const useCodeEditorWebSocket = (ws, interfaceId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!ws?.isOpen || !interfaceId) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle different types of WebSocket events
      switch (data.type) {
        case 'file_updated':
          dispatch(
            handleFileUpdate({
              path: data.path,
              content: data.content,
              operation: 'update',
            }),
          );
          break;

        case 'file_deleted':
          dispatch(
            handleFileUpdate({
              path: data.path,
              operation: 'delete',
            }),
          );
          break;

        case 'file_created':
          dispatch(
            handleFileUpdate({
              path: data.path,
              content: data.content,
              operation: 'create',
            }),
          );
          // Refresh file tree when new files are created
          dispatch(fetchFileTree(interfaceId));
          break;

        case 'repo_updated':
          // Refresh entire file tree when repository is updated
          dispatch(fetchFileTree(interfaceId));
          break;

        default:
          break;
      }
    };

    // Subscribe to WebSocket events for this interface
    const topic = `ifdevserver-filechanges:${interfaceId}`;
    ws.subscribe(topic);
    ws.addEventListener('message', handleMessage);

    return () => {
      ws.unsubscribe(topic);
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws?.isOpen, interfaceId, dispatch]);
};
