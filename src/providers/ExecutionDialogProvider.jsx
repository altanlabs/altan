import { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';

import ExecutionDetailDialog from '../components/tasks/ExecutionDetailDialog.jsx';

const ExecutionDialogContext = createContext();

export const useExecutionDialog = () => {
  const context = useContext(ExecutionDialogContext);

  if (context === undefined) {
    return {};
  }

  return context;
};

// Step 1: Update ExecutionDialog Context and Provider
const ExecutionDialogProvider = ({ children }) => {
  const [executionId, setExecutionId] = useState(null);

  const onClose = useCallback(() => setExecutionId(null), []);

  const contextValue = useMemo(() => ({
    setExecutionId,
  }), []);

  return (
    <ExecutionDialogContext.Provider value={contextValue}>
      {children}
      <ExecutionDetailDialog
        executionId={executionId}
        open={Boolean(executionId)}
        onClose={onClose}
      />
    </ExecutionDialogContext.Provider>
  );
};

export default memo(ExecutionDialogProvider);
