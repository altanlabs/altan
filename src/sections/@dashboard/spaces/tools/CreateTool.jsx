import {
  TextField,
  Stack,
  Tooltip,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  InputAdornment,
} from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ActionTypeCard from './ActionTypeCard';
// import GlobalVarsMenu from '../../../../components/flows/menuvars/GlobalVarsMenu.jsx';
import Iconify from '../../../../components/iconify/index.js';
import IconRenderer from '../../../../components/icons/IconRenderer.jsx';
import { createToolLink } from '../../../../redux/slices/spaces.js';
import { dispatch } from '../../../../redux/store.js';
import ExternalConnectionTypes from '../../flows/modulespanel/ExternalConnectionTypes.jsx';

const createLink = (tool) => dispatch(createToolLink(tool.id));

const CreateTool = () => {
  const inputRef = useRef();
  const [panelState, setPanelState] = useState({
    history: [],
    selectedConnectionType: null,
    searchTerm: '',
  });

  const { history, selectedConnectionType, searchTerm } = panelState;

  const updatePanelState = useCallback((updates) => {
    setPanelState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const [actionType, setActionType] = useState(null);

  const onGoBack = useCallback(() => {
    if (!!actionType) {
      setActionType(null);
      return;
    }
    if (!!selectedConnectionType) {
      updatePanelState({ selectedConnectionType: null });
    }
  }, [actionType, selectedConnectionType, updatePanelState]);

  const goBackTooltip = useMemo(() => {
    let title = 'tool';
    if (!actionType) {
      const previous = history.slice(-2, 0)[0];
      if (!!previous) {
        title = previous;
      }
      if (!!selectedConnectionType) {
        title = 'app';
      }
    }
    return title;
  }, [history, actionType, selectedConnectionType]);

  const setTextInputRef = (element) => {
    inputRef.current = element;
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [history.length, selectedConnectionType]);

  return (
    <>
      <Card
        sx={{
          height: '100%',
        }}
      >
        <CardHeader
          sx={{
            padding: 1,
          }}
          title={
            <Stack
              direction="row"
              spacing={1}
              padding={1}
              alignItems="center"
            >
              {(!!history?.length || actionType || !!selectedConnectionType) && (
                <Tooltip
                  arrow
                  followCursor
                  title={`Go back to ${goBackTooltip} selection`}
                >
                  <IconButton
                    size="small"
                    onClick={onGoBack}
                  >
                    <Iconify icon="mdi:chevron-left" />
                  </IconButton>
                </Tooltip>
              )}
              {/* <Typography
              variant="h6"
            >
              Create Tool
            </Typography> */}
              {!actionType && (
                <>
                  {selectedConnectionType && (
                    <IconRenderer
                      icon={selectedConnectionType.icon}
                      size={25}
                    />
                  )}
                  <TextField
                    inputRef={setTextInputRef}
                    placeholder={
                      selectedConnectionType
                        ? `Select action in ${selectedConnectionType.name}`
                        : 'Select app'
                    }
                    // value={searchTerm}
                    onChange={(e) => updatePanelState({ searchTerm: e.target.value })}
                    fullWidth
                    variant="outlined"
                    size="small"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="mdi:search" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
            </Stack>
          }
          // subheader={}
        />
        <CardContent
          sx={{
            padding: 1,
            position: 'relative',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {!actionType ? (
            <ExternalConnectionTypes
              searchTerm={searchTerm}
              selected={selectedConnectionType}
              onSelect={(value, isSemantic = false) =>
                !selectedConnectionType && !isSemantic
                  ? updatePanelState({ selectedConnectionType: value, searchTerm: '' })
                  : setActionType(value)}
              delegateSelect
            />
          ) : (
            <ActionTypeCard
              action={actionType}
              onSave={createLink}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default memo(CreateTool);
