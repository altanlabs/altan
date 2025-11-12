import React, { useCallback, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { NoAgentsDialog } from './NoAgentsDialog';
import { setOperateMode, selectCurrentAltaner } from '../../../redux/slices/altaners';
import { dispatch, useSelector } from '../../../redux/store';
import { trackFeatureUse } from '../../../utils/analytics';

interface BuildModeToggleProps {
  operateMode: boolean;
}

export const BuildModeToggle: React.FC<BuildModeToggleProps> = ({ operateMode }) => {
  const { altanerId } = useParams<{ altanerId?: string }>();
  const history = useHistory();
  const altaner = useSelector(selectCurrentAltaner);
  const [showNoAgentsDialog, setShowNoAgentsDialog] = useState(false);

  const switchToBuild = useCallback(() => {
    if (!altanerId || !operateMode) return;

    // Track mode switch to Build
    trackFeatureUse('build_run_mode_toggle', {
      mode: 'build',
      altaner_id: altanerId,
    });

    history.replace(`/project/${altanerId}`);
    dispatch(setOperateMode(false));
  }, [history, operateMode, altanerId]);

  const switchToRun = useCallback(() => {
    if (!altanerId || operateMode) return;

    // Check if altaner has agents before allowing switch to run mode
    const agentsComponent = altaner?.components?.items?.find((c: any) => c.type === 'agents');
    const agentIds = agentsComponent?.params?.ids || [];

    if (agentIds.length === 0) {
      // Show dialog and prevent mode switch
      setShowNoAgentsDialog(true);
      return;
    }

    // Track mode switch to Run
    trackFeatureUse('build_run_mode_toggle', {
      mode: 'run',
      altaner_id: altanerId,
    });

    history.replace(`/project/${altanerId}/operate`);
    dispatch(setOperateMode(true));
  }, [history, operateMode, altanerId, altaner]);

  if (!altanerId) return null;

  return (
    <>
      <NoAgentsDialog
        open={showNoAgentsDialog}
        onClose={() => setShowNoAgentsDialog(false)}
      />
      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full h-[26px] bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm">
      {/* Build Mode */}
      <button
        onClick={switchToBuild}
        className={`
          px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all
          ${
            !operateMode
              ? 'bg-white/90 dark:bg-white/20 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }
        `}
      >
        Build
      </button>

      {/* Run Mode */}
      <button
        onClick={switchToRun}
        className={`
          px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all
          ${
            operateMode
              ? 'bg-white/90 dark:bg-white/20 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }
        `}
      >
        Run
      </button>
      </div>
    </>
  );
};
