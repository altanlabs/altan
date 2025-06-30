import { Stack, Typography, IconButton } from '@mui/material';
import { memo, useState, useCallback, useMemo } from 'react';

import Iteration from './Iteration.jsx';
import Iconify from '../../../iconify';

const IteratorModule = ({
  value,
  path,
  handleClick,
  searchTerm = '',
  onSelect = null,
  disableSelection = false,
  onShowPopover = null,
}) => {
  const iteratorArray = value[Object.keys(value)[0]];
  const [selectedIteration, setSelectedIteration] = useState(0);

  const handlePrevious = useCallback(
    () => setSelectedIteration((prev) => (prev > 0 ? prev - 1 : prev)),
    [],
  );
  const handleNext = useCallback(
    () => setSelectedIteration((prev) => (prev < iteratorArray.length - 1 ? prev + 1 : prev)),
    [iteratorArray?.length],
  );

  const disabled = useMemo(
    () => !Array.isArray(iteratorArray) || iteratorArray.length === 0,
    [iteratorArray],
  );
  const content = useMemo(
    () => (disabled ? null : iteratorArray[selectedIteration]),
    [disabled, iteratorArray, selectedIteration],
  );

  if (disabled) {
    return null;
  }

  return (
    <Stack
      spacing={2}
      width="100%"
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <IconButton
          onClick={handlePrevious}
          disabled={selectedIteration === 0}
        >
          <Iconify icon="mdi:chevron-left" />
        </IconButton>
        <Typography variant="body2">
          Iteration {selectedIteration + 1} of {iteratorArray.length}
        </Typography>
        <IconButton
          onClick={handleNext}
          disabled={selectedIteration === iteratorArray.length - 1}
        >
          <Iconify icon="mdi:chevron-right" />
        </IconButton>
      </Stack>
      <Iteration
        content={content}
        path={path}
        handleClick={handleClick}
        searchTerm={searchTerm}
        onSelect={onSelect}
        disableSelection={disableSelection}
        onShowPopover={onShowPopover}
      />
    </Stack>
  );
};

export default memo(IteratorModule);
