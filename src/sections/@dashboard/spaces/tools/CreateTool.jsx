import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';

import ActionTypeCard from './ActionTypeCard';
import Iconify from '../../../../components/iconify/index.js';
import IconRenderer from '../../../../components/icons/IconRenderer.jsx';
import { createToolLink } from '../../../../redux/slices/spaces.ts';
import { dispatch } from '../../../../redux/store.ts';
import ExternalConnectionTypes from '../../flows/modulespanel/ExternalConnectionTypes.jsx';

/* ────────────────────────────────────────────────────────────────────────── */
/* Helper Functions */
/* ────────────────────────────────────────────────────────────────────────── */

const createLink = (tool, onClose) => {
  dispatch(createToolLink(tool.id));
  if (onClose) onClose();
};

const getBackTooltipText = (actionType, selectedConnectionType) => {
  if (actionType) return 'tool';
  if (selectedConnectionType) return 'app';
  return 'selection';
};

const getPlaceholder = (selectedConnectionType) => {
  return selectedConnectionType
    ? `Search actions in ${selectedConnectionType.name}...`
    : 'Search apps and actions...';
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Component */
/* ────────────────────────────────────────────────────────────────────────── */

const CreateTool = ({ onClose }) => {
  const inputRef = useRef();
  const [panelState, setPanelState] = useState({
    history: [],
    selectedConnectionType: null,
    searchTerm: '',
  });

  const { history, selectedConnectionType, searchTerm } = panelState;

  const updatePanelState = useCallback((updates) => {
    setPanelState((prev) => ({ ...prev, ...updates }));
  }, []);

  const [actionType, setActionType] = useState(null);

  const handleGoBack = useCallback(() => {
    if (actionType) {
      setActionType(null);
      return;
    }
    if (selectedConnectionType) {
      updatePanelState({ selectedConnectionType: null, searchTerm: '' });
    }
  }, [actionType, selectedConnectionType, updatePanelState]);

  const handleSearchChange = useCallback(
    (e) => {
      updatePanelState({ searchTerm: e.target.value });
    },
    [updatePanelState],
  );

  const handleSelect = useCallback(
    (value, isSemantic = false) => {
      if (!selectedConnectionType && !isSemantic) {
        updatePanelState({ selectedConnectionType: value, searchTerm: '' });
      } else {
        setActionType(value);
      }
    },
    [selectedConnectionType, updatePanelState],
  );

  const handleSave = useCallback(
    (tool) => {
      createLink(tool, onClose);
    },
    [onClose],
  );

  const backTooltipText = useMemo(
    () => getBackTooltipText(actionType, selectedConnectionType),
    [actionType, selectedConnectionType],
  );

  const placeholder = useMemo(() => getPlaceholder(selectedConnectionType), [selectedConnectionType]);

  const showBackButton = history?.length || actionType || selectedConnectionType;

  useEffect(() => {
    // Delay focus to avoid conflicting with Sheet animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250); // Wait for Sheet animation (200ms) to complete
    return () => clearTimeout(timer);
  }, [history.length, selectedConnectionType]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header - Always present to avoid layout shifts */}
        <div className={`flex-shrink-0 border-b bg-background ${actionType ? 'hidden' : ''}`}>
          <div className="flex items-center gap-2 p-2.5">
            {showBackButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGoBack}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Iconify icon="mdi:chevron-left" width={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Back to {backTooltipText} selection</p>
                </TooltipContent>
              </Tooltip>
            )}

            {selectedConnectionType && (
              <div className="flex-shrink-0">
                <div className="w-7 h-7 rounded-md border bg-muted/50 flex items-center justify-center">
                  <IconRenderer icon={selectedConnectionType.icon} size={20} />
                </div>
              </div>
            )}

            <div className="relative flex-1">
              <Iconify
                icon="mdi:search"
                width={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={inputRef}
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!actionType ? (
            <div className="h-full overflow-y-auto p-2">
              <ExternalConnectionTypes
                searchTerm={searchTerm}
                selected={selectedConnectionType}
                onSelect={handleSelect}
                delegateSelect
              />
            </div>
          ) : (
            <div className="h-full">
              <ActionTypeCard action={actionType} onSave={handleSave} />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default memo(CreateTool);
