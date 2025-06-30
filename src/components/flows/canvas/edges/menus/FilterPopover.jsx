import { IconButton, Button, Stack, Popover } from '@mui/material';
import { capitalize } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import useFeedbackDispatch from '../../../../../hooks/useFeedbackDispatch';
import {
  makeSelectConditionFilter,
  makeSelectModuleFilter,
  updateEdgeFilter,
  updateRouterConditionFilter,
} from '../../../../../redux/slices/flows';
import { useSelector } from '../../../../../redux/store';
import { bgBlur } from '../../../../../utils/cssStyles';
import { CardTitle } from '../../../../aceternity/cards/card-hover-effect.tsx';
import FilterSpec from '../../../../graphqueryspec/filterspec/FilterSpec.jsx';
import Iconify from '../../../../iconify';
// import DynamicFormField from "../../../../tools/dynamic/DynamicFormField";
import SingleSelectAutocomplete from '../../../../tools/dynamic/autocompletes/SingleSelectAutocomplete.jsx';
import FreeModeTextField from '../../../../tools/dynamic/editors/FreeModeTextField.jsx';

const FILTER_MODE_ENUM_DESCRIPTIONS = [
  'Break means the path will break if the condition logic is not met, the next module will not be executed.',
  'Skip means the module will be skipped if the condition logic is not met, the path will be executed if there is one.',
];

const FILTER_MODE_ENUM = ['break', 'skip'];

const FILTER_MODE_SCHEMA = {
  type: 'string',
  enum: FILTER_MODE_ENUM,
  enumDescriptions: FILTER_MODE_ENUM_DESCRIPTIONS,
};

const FILTER_MODE_OPTIONS = FILTER_MODE_SCHEMA.enum?.map((o, i) => ({
  value: o,
  label: capitalize(o),
  description: FILTER_MODE_SCHEMA.enumDescriptions[i],
}));

const FilterPopover = ({ popoverId, anchorEl, onClose, data }) => {
  const [filter, setFilter] = useState(null);
  const [filterMode, setFilterMode] = useState('break');
  const [newDescription, setNewDescription] = useState(null);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const { isRouteCondition, condition, targetId, sourceId } = data;
  const initialFilterSelector = useMemo(
    () => (!isRouteCondition ? makeSelectModuleFilter() : makeSelectConditionFilter()),
    [isRouteCondition],
  );

  const selectorFunction = useCallback(
    (state) =>
      !isRouteCondition
        ? initialFilterSelector(state, sourceId, targetId)
        : initialFilterSelector(state, sourceId, null, condition),
    [condition, initialFilterSelector, isRouteCondition, sourceId, targetId],
  );
  const { initialFilter, initialDescription, initialFilterMode } = useSelector(selectorFunction);

  const onSave = useCallback(() => {
    dispatchWithFeedback(
      isRouteCondition && condition
        ? updateRouterConditionFilter(sourceId, condition, filter, newDescription)
        : updateEdgeFilter(sourceId, targetId, filter, newDescription, filterMode),
      {
        successMessage: `Filter ${initialFilter ? 'updated' : 'created'} successfully`,
        errorMessage: `There was an error ${initialFilter ? 'updating' : 'creating'} the filter`,
        useSnackbar: true,
      },
    );
    onClose();
  }, [
    dispatchWithFeedback,
    isRouteCondition,
    condition,
    sourceId,
    filter,
    newDescription,
    targetId,
    filterMode,
    initialFilter,
    onClose,
  ]);

  const onDelete = useCallback(() => {
    dispatchWithFeedback(
      isRouteCondition && condition
        ? updateRouterConditionFilter(sourceId, condition)
        : updateEdgeFilter(sourceId, targetId),
      {
        successMessage: 'Filter deleted successfully',
        errorMessage: 'There was an error deleting the filter',
        useSnackbar: true,
      },
    );
    onClose();
  }, [condition, dispatchWithFeedback, isRouteCondition, onClose, sourceId, targetId]);

  useEffect(() => {
    if (!!initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    if (!!initialDescription) {
      setNewDescription(initialDescription);
    }
  }, [initialDescription]);

  useEffect(() => {
    if (!!initialFilterMode) {
      setFilterMode(initialFilterMode);
    }
  }, [initialFilterMode]);

  const open = Boolean(anchorEl);

  return (
    <Popover
      id={popoverId}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: '500px',
            backgroundColor: 'transparent',
            zIndex: 1,
          },
          className:
            'w-fit overflow-hidden relative h-fit max-h-full rounded-2xl duration-500 ease bg-gradient-to-br backdrop-blur-lg from-transparent via-[rgb(255,255,255)]/50 to-gray-200 backdrop-blur-md border dark:via-[rgb(0,0,0)]/50 dark:to-black bg-opacity-40 border-gray-300 dark:border-gray-700 shadow-lg backdrop-blur-xl gap-2',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        paddingX={2}
        paddingY={1}
        width="100%"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          minWidth: 300,
          ...bgBlur({ opacity: 0.3, blur: 4 }),
          '&:hover': {
            '& .delete-condition-icon-button': {
              display: 'flex',
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <CardTitle>{!initialFilter ? 'Set Up Filter Edge' : 'Filter Edge'}</CardTitle>
          {!!initialFilter && (
            <IconButton
              className="delete-condition-icon-button"
              color="error"
              onClick={onDelete}
              // onClick={() => setDeleteDialog(true)}
              size="small"
              sx={{
                padding: 0,
                '&:hover': {
                  '& .delete-condition-icon': {
                    width: 18,
                  },
                },
              }}
            >
              <Iconify
                icon="ic:round-delete"
                className="delete-condition-icon"
                sx={{
                  transition: 'width 300ms ease',
                  width: 15,
                }}
              />
            </IconButton>
          )}
        </Stack>
        <Button
          variant="soft"
          onClick={onSave}
          disabled={!filter}
          startIcon={<Iconify icon="dashicons:saved" />}
        >
          Save
        </Button>
      </Stack>
      <Stack
        padding={1}
        spacing={1}
      >
        <FreeModeTextField
          multiline
          title="Description"
          schema={{}}
          value={newDescription || ''}
          onChange={setNewDescription}
          sx={{
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        />
        <FilterSpec
          value={filter}
          onChange={setFilter}
        />
        {!(isRouteCondition && condition) && !!Object.keys(filter ?? {}).length && (
          <SingleSelectAutocomplete
            value={filterMode}
            onChange={setFilterMode}
            title="Filter Mode"
            options={FILTER_MODE_OPTIONS}
            selectedSchema={FILTER_MODE_SCHEMA}
          />
        )}
      </Stack>
    </Popover>
  );
};

export default memo(FilterPopover);
