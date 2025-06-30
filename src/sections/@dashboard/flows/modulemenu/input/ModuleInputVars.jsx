import CloseIcon from '@mui/icons-material/Close';
import {
  Stack,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  List,
  ListItemButton,
  Chip,
  Popover,
} from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@lib/utils';

import { resolveNested } from '../../../../../components/flows/executions/ModuleVar.jsx';
import ModuleVars from '../../../../../components/flows/executions/ModuleVars.jsx';
import {
  ModuleIcon,
  ModuleType,
} from '../../../../../components/flows/schemas/modulePanelSections.jsx';
import Iconify from '../../../../../components/iconify';
import { selectFlowNodes } from '../../../../../providers/flows/utils';
import {
  selectFlowModules,
  selectModuleInMenu,
  getFlowExecutionDetails,
  getFlowExecutions,
  selectCurrentExecution,
  selectFlowId,
} from '../../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../../redux/store';

const ModuleSelectionButton = memo(
  ({ module, onSelect, disabledVarSelection = false, isCurrent = false }) => {
    return (
      <ListItemButton
        onClick={onSelect}
        className={cn('p-1', disabledVarSelection && 'opacity-50')}
      >
        {!!isCurrent && (
          <Chip
            label="Current [$]"
            size="small"
            sx={{ position: 'absolute', top: 5, right: 5 }}
          />
        )}
        <Stack
          direction="row"
          width="100%"
          spacing={2}
          alignItems="center"
          justifyContent="flex-start"
        >
          <ModuleIcon
            module={module}
            size={20}
          />
          <Stack
            direction="column"
            spacing={0}
          >
            <ModuleType
              module={module}
              variant="body"
              // typographySx={{ fontWeight: "bold", fontSize: "0.7rem", ml: 0 }}
            />
            {module?.tool && (
              <Typography variant="caption">{module.tool.action_type.name}</Typography>
            )}
          </Stack>
        </Stack>
      </ListItemButton>
    );
  },
);

ModuleSelectionButton.displayName = 'ModuleSelectionButton';

const ModuleInputTab = memo(({ module, onClose, index }) => {
  const label = (
    <div className="flex flex-row items-center w-full space-x-1">
      <ModuleIcon
        module={module}
        size={15}
      />
      <ModuleType
        module={module}
        variant="h6"
        typographySx={{ fontWeight: 'bold', fontSize: '0.8rem' }}
      />
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          boxShadow: '0px 0px 1px #888',
          opacity: 0.5,
          transition: 'opacity 300ms ease',
          '&:hover': {
            opacity: 0.9,
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose(index);
        }}
      >
        <CloseIcon fontSize="small" />
      </Box>
    </div>
  );
  return (
    <Tab
      key={index}
      label={label}
      value={index}
      sx={{ minWidth: 'auto', px: 1 }}
      className="before:backdrop-hack before:backdrop-blur-lg"
    />
  );
});

ModuleInputTab.displayName = 'ModuleInputTab';

class ModulePathFinder {
  constructor(nodes) {
    this.nodeMap = nodes;
    this.visited = new Set();
  }

  getModulePath(moduleId) {
    let modulesPathList = [];
    let current = moduleId;
    let thereWasPreviousModule = false;

    while (current) {
      if (Array.isArray(current)) {
        const paths = current
          .map((id) => this.getModulePath(id).reverse())
          .reverse()
          .flatMap((a) => a.reverse());
        modulesPathList = [...new Set([...paths, ...modulesPathList].reverse())];
        current = null;
        thereWasPreviousModule = true;
      } else {
        if (this.visited.has(current)) {
          break; // Exit the loop to avoid revisiting.
        }
        this.visited.add(current); // Mark the current node as visited.
        modulesPathList.push(current);
        const node = this.nodeMap.get(current);
        current = node?.data.previousId;
      }
    }

    return thereWasPreviousModule ? modulesPathList.reverse() : modulesPathList;
  }
}

const selectInitializedExecutions = (state) => state.flows.initialized.executions;
const selectisLoadingExecutions = (state) => state.flows.isLoading.executions;

const ModuleInputVars = ({ searchTerm = '', onSelect = null }) => {
  const [tabs, setTabs] = useState([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [showModuleSelection, setShowModuleSelection] = useState(true);
  const [popoverContent, setPopoverContent] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  const initialized = useSelector(selectInitializedExecutions);
  const isLoading = useSelector(selectisLoadingExecutions);
  const flowId = useSelector(selectFlowId);
  const currentExecutions = useSelector(selectCurrentExecution);
  const flowModules = useSelector(selectFlowModules);
  const moduleInMenu = useSelector(selectModuleInMenu);
  const nodes = useSelector(selectFlowNodes);

  useEffect(() => {
    if (!currentExecutions && !!flowId && !initialized && !isLoading) {
      dispatch(getFlowExecutions(flowId));
    }
  }, [flowId, initialized, isLoading, currentExecutions]);

  useEffect(() => {
    if (!currentExecutions && initialized && !!flowId) {
      dispatch(getFlowExecutionDetails(null, flowId));
    }
  }, [currentExecutions, initialized, flowId]);

  const modules = useMemo(() => {
    if (!currentExecutions) {
      return null;
    }
    const lastCurrentExecution = Object.entries(currentExecutions)
      // Sort by date_creation descending, placing undefined dates last.
      .sort(([, { details: aDetails }], [, { details: bDetails }]) => {
        const dateA = new Date(aDetails.date_creation || 0);
        const dateB = new Date(bDetails.date_creation || 0);
        return dateB - dateA;
      })[0];
    const [, { modules }] = lastCurrentExecution;
    return modules;
  }, [currentExecutions]);

  const handleShowPopover = useCallback((event, content) => {
    setPopoverContent(content);
    setPopoverAnchor(event.currentTarget);
  }, []);

  const handleHidePopover = useCallback(() => {
    setPopoverContent(null);
    setPopoverAnchor(null);
  }, []);

  const limitModuleId = useMemo(
    () =>
      !!moduleInMenu && (moduleInMenu.after?.id || nodes?.get(moduleInMenu.id)?.data.previousId),
    [nodes, moduleInMenu],
  );

  const modulesPath = useMemo(() => {
    const finder = new ModulePathFinder(nodes);
    return finder.getModulePath(limitModuleId);
  }, [nodes, limitModuleId]);

  const modulesPathWithCurrent = useMemo(
    () => [moduleInMenu?.id, ...modulesPath],
    [moduleInMenu?.id, modulesPath],
  );

  const handleAddTab = useCallback(() => {
    setShowModuleSelection(true);
    setSelectedTabIndex(tabs.length); // Select the "Add Tab" pseudo-tab
  }, [tabs.length]);

  const handleModuleSelect = useCallback(
    (moduleId) => {
      setTabs([...tabs, moduleId]);
      setSelectedTabIndex(tabs.length); // Select the new tab
      setShowModuleSelection(false);
    },
    [tabs],
  );

  const handleCloseTab = useCallback(
    (index) => {
      const newTabs = [...tabs];
      newTabs.splice(index, 1);
      setTabs(newTabs);
      if (selectedTabIndex >= index) {
        setSelectedTabIndex(Math.max(selectedTabIndex - 1, 0));
      }
      if (newTabs.length === 0) {
        setShowModuleSelection(true);
      }
    },
    [selectedTabIndex, tabs],
  );

  const selectedModuleId = tabs[selectedTabIndex];

  const mustShowCurrent =
    moduleInMenu?.id === selectedModuleId && flowModules[moduleInMenu?.id]?.type === 'iterator';

  const isCurrent = useCallback((moduleId) => moduleInMenu?.id === moduleId, [moduleInMenu?.id]);

  const mustEnableCurrent = useCallback(
    (moduleId) => isCurrent(moduleId) && flowModules[moduleId]?.type === 'iterator',
    [flowModules, isCurrent],
  );

  const onTabChange = useCallback(
    (e, newIndex) => {
      if (newIndex === tabs.length) {
        handleAddTab();
      } else {
        setSelectedTabIndex(newIndex);
        setShowModuleSelection(false);
      }
    },
    [handleAddTab, tabs.length],
  );

  const moduleExecutions = useMemo(() => {
    if (!selectedModuleId || !modules || !flowModules || !nodes) {
      // console.log("Missing required data:", { selectedModuleId, modules, flowModules, nodes });
      return null;
    }

    const currentModule = flowModules[selectedModuleId];
    const execs = modules[selectedModuleId];

    if (!currentModule || !execs) {
      // console.log('Module or executions not found:', { currentModule, execs });
      return null;
    }

    // console.log("Current module:", currentModule);

    let overrideGlobalVars = null;
    if (currentModule.type === 'iterator' && currentModule.field) {
      // console.log("Processing iterator module:", currentModule);
      const cleanField =
        currentModule.field.startsWith('[') && currentModule.field.endsWith(']')
          ? currentModule.field.slice(1, -1).split(',')[0]
          : currentModule.field.replace('{{', '').replace('}}', '');

      // console.log("Clean field:", cleanField);

      const [modulePositionRaw] = cleanField.split('.', 1);
      const modulePosition = parseInt(modulePositionRaw.slice(1, -1), 10);

      // console.log("Module position to iterate:", modulePosition);

      // Find the module ID for the given position
      const moduleIdToIterate = Object.keys(flowModules).find(
        (id) => flowModules[id].position === modulePosition,
      );

      // console.log("Module ID to iterate:", moduleIdToIterate);

      if (moduleIdToIterate && modules[moduleIdToIterate]) {
        // console.log("Found module to iterate:", flowModules[moduleIdToIterate]);
        const moduleToIterateExecs = modules[moduleIdToIterate];
        const sortedExecs = Object.values(moduleToIterateExecs).sort(
          (a, b) => b.timestamp - a.timestamp,
        );

        if (sortedExecs.length > 0) {
          overrideGlobalVars = sortedExecs.map((mExec) => {
            const resolved = resolveNested(cleanField, mExec.content ?? mExec.global_vars ?? {});
            // console.log('Resolved nested value:', resolved);
            return resolved;
          });
        }
      }
      // else {
      //   console.log('Module to iterate not found');
      // }
    }

    const moduleDetails = {
      id: currentModule.id,
      executions: [],
    };

    Object.entries(execs)
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .forEach(([moduleExecId, moduleExec]) => {
        const content = overrideGlobalVars
          ? { [`[${currentModule.position}]`]: overrideGlobalVars[0] }
          : (moduleExec.content ?? moduleExec.global_vars);

        // console.log("Execution content:", content);

        moduleDetails.executions.push({
          id: moduleExecId,
          status: moduleExec.status,
          timestamp: moduleExec.timestamp,
          content: content,
        });
      });

    // console.log("Final module details:", moduleDetails);
    return [moduleDetails];
  }, [selectedModuleId, modules, flowModules, nodes]);

  return (
    <>
      <div className="sticky top-0 w-full bg-white dark:bg-gray-900">
        <Tabs
          value={selectedTabIndex}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTabs-flexContainer': { gap: 0.5 } }}
        >
          {tabs.map((tab, index) => (
            <ModuleInputTab
              key={`module-input-tab-${index}`}
              module={flowModules[tab]}
              index={index}
              onClose={handleCloseTab}
            />
          ))}
          <Tab
            label={
              <IconButton size="small">
                <Iconify
                  icon="mdi:plus"
                  width={20}
                />
              </IconButton>
            }
            value={tabs.length}
            className="min-w-auto px-1"
            // sx={{ minWidth: 'auto', px: 1 }}
          />
        </Tabs>
      </div>
      <Box className="flex w-full bg-white dark:bg-gray-900">
        {showModuleSelection ? (
          <List className="w-full">
            {Object.values(flowModules)
              .sort((a, b) =>
                (modulesPathWithCurrent.indexOf(b.id) ?? -1) >
                (modulesPathWithCurrent.indexOf(a.id) ?? -1)
                  ? 1
                  : -1,
              )
              .map((module) => (
                <ModuleSelectionButton
                  key={`module-selection-${module.id}`}
                  module={module}
                  onSelect={() => handleModuleSelect(module.id)}
                  disabledVarSelection={
                    !modulesPath.includes(module.id) && !mustEnableCurrent(module.id)
                  }
                  isCurrent={isCurrent(module.id)}
                />
              ))}
          </List>
        ) : moduleExecutions ? (
          moduleExecutions.map(({ id, executions }) => (
            <ModuleVars
              key={`global_vars-${id}`}
              moduleId={id}
              executions={executions}
              searchTerm={searchTerm}
              onSelect={onSelect}
              mustShowCurrent={mustShowCurrent}
              disableSelection={!modulesPath.includes(id) && !mustEnableCurrent(id)}
              onShowPopover={handleShowPopover}
            />
          ))
        ) : (
          <Typography
            variant="caption"
            sx={{ m: 2 }}
          >
            Execute Workflow to see Input values.
          </Typography>
        )}
      </Box>
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handleHidePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          zIndex: 99999,
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'transparent',
              maxWidth: { md: '80vw', lg: '60vw' },
            },
            className:
              'p-2 text-sm bg-transparent border border-gray-400/40 rounded shadow-lg break-words backdrop-blur-lg',
          },
        }}
      >
        {popoverContent}
      </Popover>
    </>
  );
};

export default memo(ModuleInputVars);
