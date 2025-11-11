import React, { useCallback } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { dispatch } from '../../../redux/store';
import { setOperateMode } from '../../../redux/slices/altaners';

interface BuildModeToggleProps {
  operateMode: boolean;
}

export const BuildModeToggle: React.FC<BuildModeToggleProps> = ({ operateMode }) => {
  const { altanerId } = useParams<{ altanerId?: string }>();
  const location = useLocation();
  const history = useHistory();

  const switchToBuild = useCallback(() => {
    if (!altanerId || !operateMode) return;
    history.replace(`/project/${altanerId}`);
    dispatch(setOperateMode(false));
  }, [history, operateMode, altanerId]);

  const switchToRun = useCallback(() => {
    if (!altanerId || operateMode) return;
    history.replace(`/project/${altanerId}/operate`);
    dispatch(setOperateMode(true));
  }, [history, operateMode, altanerId]);

  if (!altanerId) return null;

  return (
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
  );
};

