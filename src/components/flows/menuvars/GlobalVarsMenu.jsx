import { memo, useCallback, useMemo } from 'react';

import { closeGlobalVarsMenu, selectGlobalVars } from '../../../redux/slices/general/index.ts';
import { dispatch, useSelector } from '../../../redux/store.ts';
import ModuleInput from '../../../sections/@dashboard/flows/modulemenu/input/ModuleInput.jsx';
import FloatingWindow from '../../floating/FloatingWindow.jsx';

// Selectors for Redux state
const selectGlobalVarsOpen = (state) => selectGlobalVars(state).open;
const selectGlobalVarsContext = (state) => selectGlobalVars(state).context;
const selectGlobalVarsEditorId = (state) => selectGlobalVarsContext(state)?.editorId;
const selectGlobalVarsAnchorEl = (state) => selectGlobalVarsContext(state)?.anchorEl;

// Handler to close the menu
const handleClose = () => dispatch(closeGlobalVarsMenu());

/**
 * GlobalVarsMenu - Floating window for selecting variables and helpers
 * Appears on top of all other components with highest z-index
 */
const GlobalVarsMenu = ({ mode = 'flow' }) => {
  const isOpen = useSelector(selectGlobalVarsOpen);
  const editorId = useSelector(selectGlobalVarsEditorId);
  const anchorEl = useSelector(selectGlobalVarsAnchorEl);

  const handleOptionSelect = useCallback(
    (option) => {
      // Dispatch custom event with selected value for the editor
      const event = new CustomEvent(`menuSelect:${editorId}`, {
        detail: { value: option },
      });
      window.dispatchEvent(event);
    },
    [editorId],
  );

  const content = useMemo(
    () => (
    <ModuleInput
      onSelect={handleOptionSelect}
      mode={mode}
    />
    ),
    [handleOptionSelect, mode],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <FloatingWindow
      name="Select variables and helpers"
      baseWidth={400}
      baseHeight={700}
      anchorEl={anchorEl}
      onClose={handleClose}
      enableExpand
      enableMinimize
      usePortal
      additionalClasses="z-[10001]"
    >
      {content}
    </FloatingWindow>
  );
};

export default memo(GlobalVarsMenu);
