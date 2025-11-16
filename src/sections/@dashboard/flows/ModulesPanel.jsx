import { TextField, Drawer, Stack, IconButton, Divider, Typography, Tooltip } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';

import ExternalConnectionTypes from './modulespanel/ExternalConnectionTypes.jsx';
import PanelRow from './modulespanel/PanelRow.jsx';
import { modulesPanelSchema } from '../../../components/flows/schemas/modulePanelSections.jsx';
import Iconify from '../../../components/iconify';
import IconRenderer from '../../../components/icons/IconRenderer.jsx';
import {
  clearNewModuleInDrawer,
  createModule,
  selectFlowId,
  selectFlowMetadata,
  selectModuleInPanelNew,
  selectPanelNew,
  setNewModuleType,
} from '../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../redux/store.ts';
import { bgBlur } from '../../../utils/cssStyles';

const onCloseMenu = () => dispatch(clearNewModuleInDrawer());

const ModulesPanel = () => {
  const inputRef = useRef();
  const [panelsState, setPanelsState] = useState({});
  const module = useSelector(selectModuleInPanelNew);
  const modulesPanelNew = useSelector(selectPanelNew);
  const flowId = useSelector(selectFlowId);
  const flowMetadata = useSelector(selectFlowMetadata);
  const currentPanelId = useMemo(
    () =>
      modulesPanelNew?.condition
        ? `${modulesPanelNew?.id}-${modulesPanelNew?.condition}`
        : modulesPanelNew?.id,
    [modulesPanelNew],
  );

  const panelState = useMemo(
    () =>
      panelsState[currentPanelId] || {
        history: [],
        selectedConnectionType: null,
        searchTerm: '',
      },
    [currentPanelId, panelsState],
  );

  const { history, selectedConnectionType, searchTerm } = panelState;

  const updatePanelState = useCallback(
    (updates) => {
      setPanelsState((prev) => ({
        ...prev,
        [currentPanelId]: {
          ...prev[currentPanelId],
          ...updates,
        },
      }));
    },
    [currentPanelId],
  );

  const selectedSection = useMemo(() => {
    let section = modulesPanelSchema;
    history.forEach((h) => {
      if (section?.sections) {
        section = section.sections[h];
      }
    });
    return section;
  }, [history]);

  const onGoBack = useCallback(() => {
    if (!!module?.type) {
      dispatch(setNewModuleType(null));
      return;
    }
    if (!!selectedConnectionType) {
      updatePanelState({ selectedConnectionType: null });
    } else {
      updatePanelState({
        history: panelState.history.slice(0, -1),
      });
    }
  }, [module?.type, panelState.history, selectedConnectionType, updatePanelState]);

  const goBackTooltip = useMemo(() => {
    let title = 'module';
    if (!module?.type) {
      const previous = history.slice(-2, 0)[0];
      if (!!previous) {
        title = previous;
      }
      if (!!selectedConnectionType) {
        title = 'app';
      }
    }
    return title;
  }, [history, selectedConnectionType, module?.type]);

  useEffect(() => {
    updatePanelState({
      history: [],
      selectedConnectionType: null,
      searchTerm: '',
    });
  }, [modulesPanelNew?.id]);

  const setTextInputRef = useCallback((element) => {
    inputRef.current = element;
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history.length, selectedConnectionType]);

  const SubSectionComponent = useMemo(
    () =>
      selectedSection.sections instanceof Function
        ? selectedSection.sections({
            searchTerm,
            selected: selectedConnectionType,
            onSelect: (value) =>
              updatePanelState({ selectedConnectionType: value, searchTerm: '' }),
          })
        : null,
    [searchTerm, selectedConnectionType, selectedSection, updatePanelState],
  );

  const getSections = useCallback(() => {
    if (searchTerm?.length && !history?.length) {
      const allSections = Object.entries(selectedSection.sections);
      return allSections.reduce((acc, [k, v]) => {
        if (v.sections) {
          Object.entries(v.sections).forEach(([k1, v1]) => {
            acc[k1] = v1;
          });
        } else {
          acc[k] = v;
        }
        return acc;
      }, {});
    }
    return selectedSection.sections;
  }, [history?.length, searchTerm?.length, selectedSection.sections]);

  const filterSections = useCallback(
    (sections) => {
      return Object.entries(sections)
        .filter(([k, v]) => {
          if (!searchTerm?.length) return true;
          const search = searchTerm.toLowerCase();
          const description = v.description?.toLowerCase().includes(search);
          const title = (v.title ?? k)?.toLowerCase().includes(search);
          return description || title;
        })
        .sort(([k1, v1], [k2, v2]) => {
          const title1 = (v1.title ?? k1).toLowerCase();
          const title2 = (v2.title ?? k2).toLowerCase();
          return title1.localeCompare(title2);
        });
    },
    [searchTerm],
  );

  const handleClick = useCallback(
    (value, key) => {
      if (value.disabled) return;

      if (value.sections) {
        updatePanelState({
          history: [...history, key],
        });
      } else {
        if (value.module === 'router') {
          dispatch(
            createModule({
              flowId,
              data: {
                module: {
                  type: value.module,
                  ...(value.args || {}),
                  conditions: [
                    {
                      priority: 0,
                      condition_logic: null,
                      next_module_id: null,
                    },
                  ],
                },
              },
              after: modulesPanelNew,
              getPosition: true,
            }),
          ).then(() => dispatch(clearNewModuleInDrawer()));
        } else {
          dispatch(
            setNewModuleType({
              type: value.module,
              ...(value.args || {}),
            }),
          );
        }
      }
    },
    [flowId, history, modulesPanelNew, updatePanelState],
  );

  const renderPanelRows = useCallback(() => {
    const sections = getSections();
    const filteredSections = filterSections(sections);

    return filteredSections.map(([key, value]) => (
      <PanelRow
        key={`sub-section-${key}`}
        icon={value.icon}
        name={value.title ?? key}
        description={value.description}
        onClick={() => handleClick(value, key)}
        hideArrow={!value.sections}
        disabled={value.disabled}
      />
    ));
  }, [filterSections, getSections, handleClick]);

  return (
    <Drawer
      anchor="right"
      open={!!modulesPanelNew}
      onClose={onCloseMenu}
      PaperProps={{
        sx: {
          maxWidth: { xs: '60vw', sm: '40vw', md: '30vw', lg: '20vw' },
          display: 'flex',
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          backgroundColor: 'transparent',
        },
        className:
          'rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg before:backdrop-blur-xl before:backdrop-hack',
      }}
      slotProps={{
        backdrop: {
          sx: {
            ...bgBlur({ opacity: 0.2, blur: 6 }),
          },
        },
        root: {
          sx: {
            backgroundColor: 'transparent',
          },
        },
      }}
    >
      <Stack
        direction="row"
        paddingY={1}
        paddingX={2}
        spacing={1}
        alignItems="center"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {(!!history?.length || module?.type || !!selectedConnectionType) && (
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
        {!module?.type && (
          <>
            <IconRenderer
              icon={selectedSection.icon}
              size={30}
            />
            <TextField
              inputRef={setTextInputRef}
              label={selectedSection.title}
              value={searchTerm}
              onChange={(e) => updatePanelState({ searchTerm: e.target.value })}
              fullWidth
              variant="filled"
              size="small"
              autoFocus
            />
          </>
        )}
      </Stack>
      {!module?.type && (SubSectionComponent ?? renderPanelRows())}
      {!module?.type && !history?.length && (
        <>
          <Divider
            sx={{
              mt: 1,
              mb: 0,
            }}
          >
            <Typography variant="caption">Apps</Typography>
          </Divider>
          <ExternalConnectionTypes
            searchTerm={searchTerm}
            selected={selectedConnectionType}
            onSelect={(value) =>
              updatePanelState({ selectedConnectionType: value, searchTerm: '' })}
            featured={flowMetadata.connection_types}
          />
        </>
      )}
    </Drawer>
  );
};

export default memo(ModulesPanel);
