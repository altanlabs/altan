import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { memo, useState, useCallback, useMemo } from 'react';
// import useResponsive from "../../../../hooks/useResponsive";
import { FormProvider } from 'react-hook-form';

import { useExternalSettings } from './provider/SAExternalSettingsProvider';
import Iconify from '../../../../components/iconify';
import IconRenderer from '../../../../components/icons/IconRenderer';
import FormParameters from '../../../../components/tools/form/FormParameters';
import ExecutionResult from '../components/execution/ExecutionResult';

const renderOption = ({ key, ...props }, option, { selected }) => {
  return (
    <li
      key={key}
      {...props}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        <IconRenderer icon={option.icon} />
        <Typography color={'text.primary'}>{option.name}</Typography>
      </Stack>
    </li>
  );
};

const getOptionLabel = (option) => option.name;
const getOptionKey = (option) => option.id;

const RenderAutocomplete = memo(({ label, selected, available, loading, setSelected }) => {
  const onChange = useCallback(
    (event, newValue) => setSelected(!!newValue ? newValue.id : null),
    [setSelected],
  );
  return (
    <Autocomplete
      size="small"
      fullWidth
      value={selected ?? null}
      options={available ?? []}
      getOptionLabel={getOptionLabel}
      getOptionKey={getOptionKey}
      loading={loading}
      onChange={onChange}
      autoFocus={!selected}
      autoComplete={!selected}
      autoHighlight={!selected}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="filled"
          InputProps={{
            autoFocus: !selected,
            ...params.InputProps,
            startAdornment: !!selected?.icon && (
              <InputAdornment position="end">
                <IconRenderer icon={selected.icon} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                  />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={renderOption}
    />
  );
});

const SAExternalDrawer = () => {
  const {
    apps,
    connectionTypes,
    connections,
    actionTypes,
    actionExecution,
    toolParametersMethods,
    selectedApp,
    selectedConnectionType,
    selectedConnection,
    selectedAction,
    setSelectedApp,
    setSelectedConnectionType,
    setSelectedConnection,
    setSelectedAction,
    onActionExecute,
    allProperties,
    allRequired,
  } = useExternalSettings();
  // const isSmallScreen = useResponsive('down', 'sm');
  const [isConnectionSelectorOpen, setIsConnectionSelectorOpen] = useState(null);

  const closeConnectionSelector = useCallback(() => setIsConnectionSelectorOpen(false), []);
  const openConnectionSelector = useCallback((e) => {
    if (e.currentTarget) {
      setIsConnectionSelectorOpen(e.currentTarget);
    }
  }, []);

  const actionSchema = useMemo(
    () => ({
      properties: allProperties,
      required: allRequired,
    }),
    [allProperties, allRequired],
  );

  return (
    <Stack
      width="100%"
      spacing={1}
    >
      {!(selectedApp && selectedConnectionType) && (
        <>
          <RenderAutocomplete
            label={!selectedApp ? 'Choose an App' : 'Selected App'}
            selected={selectedApp}
            available={apps}
            loading={false}
            setSelected={setSelectedApp}
          />
          {!!selectedApp && (
            <RenderAutocomplete
              label={
                !selectedConnectionType ? 'Choose a Connection Type' : 'Selected Connection Type'
              }
              selected={selectedConnectionType}
              available={connectionTypes.available}
              loading={connectionTypes.loading}
              setSelected={setSelectedConnectionType}
            />
          )}
        </>
      )}
      {!!selectedConnectionType && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          width="100%"
        >
          <Popover
            open={Boolean(isConnectionSelectorOpen)}
            anchorEl={isConnectionSelectorOpen}
            slotProps={{
              tooltip: {
                sx: {
                  padding: 0,
                },
              },
            }}
            onClose={closeConnectionSelector}
          >
            <Card className="w-[250]">
              <CardHeader
                title="Connection Settings"
                subheader="Set the App and Connection Type"
              />
              <CardContent>
                <Stack spacing={0.5}>
                  <RenderAutocomplete
                    label={!selectedApp ? 'Choose an App' : 'Selected App'}
                    selected={selectedApp}
                    available={apps}
                    loading={false}
                    setSelected={setSelectedApp}
                  />
                  {!!selectedApp && (
                    <RenderAutocomplete
                      label={
                        !selectedConnectionType
                          ? 'Choose a Connection Type'
                          : 'Selected Connection Type'
                      }
                      selected={selectedConnectionType}
                      available={connectionTypes.available}
                      loading={connectionTypes.loading}
                      setSelected={setSelectedConnectionType}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Popover>
          <IconButton
            size="small"
            onClick={openConnectionSelector}
          >
            <IconRenderer
              icon={selectedConnectionType.icon}
              size={25}
            />
          </IconButton>
          <RenderAutocomplete
            label={!selectedConnection ? 'Choose a Connection' : 'Selected Connection'}
            selected={selectedConnection}
            available={connections.available}
            loading={connections.loading}
            setSelected={setSelectedConnection}
          />
        </Stack>
      )}

      {!!selectedConnection && (
        <RenderAutocomplete
          label={!selectedAction ? 'Choose an action to execute' : 'Selected Action'}
          selected={selectedAction}
          available={actionTypes.available}
          loading={actionTypes.loading}
          setSelected={setSelectedAction}
        />
      )}
      {!!(selectedAction && !!selectedConnection) && (
        <>
          <FormProvider {...toolParametersMethods}>
            <FormParameters
              actionSchema={actionSchema}
              path=""
              // relationships={relationships}
            />
          </FormProvider>
          <LoadingButton
            size="small"
            variant="soft"
            color="secondary"
            loading={actionExecution.loading}
            onClick={onActionExecute}
            startIcon={<Iconify icon="ic:twotone-offline-bolt" />}
          >
            Execute
          </LoadingButton>
          {!!actionExecution.result && !!selectedAction && <ExecutionResult />}
        </>
      )}
    </Stack>
  );
};

export default memo(SAExternalDrawer);
