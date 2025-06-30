import { memo, useCallback } from 'react';

import { closeGlobalVarsMenu, selectGlobalVars } from '../../../redux/slices/general';
import { dispatch, useSelector } from '../../../redux/store';
import ModuleInput from '../../../sections/@dashboard/flows/modulemenu/input/ModuleInput.jsx';
import FloatingWindow from '../../floating/FloatingWindow.jsx';

const selectGlobalVarsOpen = (state) => selectGlobalVars(state).open;
const selectGlobalVarsContext = (state) => selectGlobalVars(state).context;
const selectGlobalVarsEditorId = (state) => selectGlobalVarsContext(state)?.editorId;
const selectGlobalVarsAnchorEl = (state) => selectGlobalVarsContext(state)?.anchorEl;
// const selectGlobalVarsPosition = (state) => selectGlobalVars(state).position;

const onClose = () => dispatch(closeGlobalVarsMenu());

const GlobalVarsMenu = ({ mode = 'flow' }) => {
  const isOpen = useSelector(selectGlobalVarsOpen);
  const editorId = useSelector(selectGlobalVarsEditorId);
  const anchorEl = useSelector(selectGlobalVarsAnchorEl);

  const handleOptionSelect = useCallback(
    (option) => {
      // Dispatch a custom event with the selected value
      const event = new CustomEvent(`menuSelect:${editorId}`, { detail: { value: option } });
      window.dispatchEvent(event);
    },
    [editorId],
  );

  const content = (
    <ModuleInput
      onSelect={handleOptionSelect}
      mode={mode}
    />
  );

  if (!isOpen) {
    return null;
  }

  return (
    <FloatingWindow
      name="Select variables and helpers"
      // offsetX={window.innerWidth/2-300}
      // mode={props.mode || 'room'}
      baseWidth={400}
      baseHeight={700}
      anchorEl={anchorEl}
      onClose={onClose}
      enableExpand={true}
      enableMinimize={true}
      usePortal={true}
    >
      {content}
    </FloatingWindow>
  );
};

export default memo(GlobalVarsMenu);
