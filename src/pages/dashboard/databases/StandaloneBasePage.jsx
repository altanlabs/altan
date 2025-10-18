import { memo, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';

import Base from '../../../components/databases/base/Base';
import { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider.jsx';
import { selectBaseById } from '../../../redux/slices/bases';

function StandaloneBasePage() {
  const { baseId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hideChat = searchParams.get('hideChat') === 'true';
  const ws = useHermesWebSocket();

  // Move the selector inside the component and memoize it
  const selectBaseAndAccountId = useMemo(
    () => (state) => {
      const base = baseId ? selectBaseById(state, baseId) : null;
      return {
        base,
        accountId: base?.account_id,
      };
    },
    [baseId],
  );

  const { base, accountId } = useSelector(
    selectBaseAndAccountId,
    (prev, next) => prev.accountId === next.accountId && prev.base === next.base,
  );
  // Subscribe to account channel
  useEffect(() => {
    if (ws?.isOpen && accountId) {
      ws.subscribe(`account:${accountId}`);

      return () => {
        ws.unsubscribe(`account:${accountId}`);
      };
    }
  }, [ws?.isOpen, accountId]);

  useEffect(() => {
    if (!accountId && ws?.isOpen) {
      ws.disconnect();
    }
  }, [accountId, ws?.isOpen]);

  // Create a regular callback function instead of memoizing a function value
  const handleNavigate = useCallback(
    (_, { baseId, tableId, viewId }) => {
      if (tableId && viewId) {
        history.push(`/database/${baseId}/tables/${tableId}/views/${viewId}`);
      }
    },
    [history.push],
  );

  return (
    <>
      <Helmet>
        <title>{base?.name || 'Database'} · Altan Database</title>
      </Helmet>
      <div className="h-screen w-screen overflow-hidden">
        <Base
          hideChat={hideChat}
          onNavigate={handleNavigate}
        />
      </div>
    </>
  );
}

export default memo(StandaloneBasePage);
