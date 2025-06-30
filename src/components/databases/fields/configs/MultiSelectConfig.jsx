// src/components/databases/fields/configs/MultiSelectConfig.jsx
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, TextField, IconButton, Popover } from '@mui/material';
import { memo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PRESET_COLORS = [
  '#E57373',
  '#F06292',
  '#BA68C8',
  '#9575CD',
  '#7986CB',
  '#64B5F6',
  '#4FC3F7',
  '#4DD0E1',
  '#4DB6AC',
  '#81C784',
  '#AED581',
  '#FFD54F',
];

const MultiSelectConfig = ({ config, onChange }) => {
  const [newOption, setNewOption] = useState('');
  const [colorAnchor, setColorAnchor] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    onChange({
      ...config,
      select_options: [
        ...(config.select_options || []),
        {
          id: crypto.randomUUID(),
          label: newOption,
          color: PRESET_COLORS[(config.select_options?.length || 0) % PRESET_COLORS.length],
        },
      ],
    });
    setNewOption('');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(config.select_options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange({ ...config, select_options: items });
  };

  return (
    <Box className="p-2 space-y-2">
      <TextField
        fullWidth
        label="Option name"
        variant="outlined"
        size="small"
        value={newOption}
        onChange={(e) => setNewOption(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
        className="mb-2"
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="options">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {(config.select_options || []).map((option, index) => (
                <Draggable
                  key={option.id || `option-${index}`}
                  draggableId={String(option.id || `option-${index}`)}
                  index={index}
                >
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center p-1 mb-1 border border-gray-300 rounded"
                    >
                      <Box
                        {...provided.dragHandleProps}
                        className="px-1"
                      >
                        <DragIndicatorIcon fontSize="small" />
                      </Box>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: option.color || PRESET_COLORS[0],
                          cursor: 'pointer',
                          mr: 1,
                        }}
                        onClick={(e) => {
                          setColorAnchor(e.currentTarget);
                          setSelectedOptionIndex(index);
                        }}
                      />
                      <TextField
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...config.select_options];
                          newOptions[index].label = e.target.value;
                          onChange({ ...config, select_options: newOptions });
                        }}
                        size="small"
                        variant="standard"
                        fullWidth
                        className="mx-1"
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          onChange({
                            ...config,
                            select_options: config.select_options.filter((o) => o.id !== option.id),
                          });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box className="p-2 grid grid-cols-6 gap-1">
          {PRESET_COLORS.map((color) => (
            <Box
              key={color}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: '50%',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => {
                const newOptions = config.select_options.map((opt, idx) =>
                  idx === selectedOptionIndex ? { ...opt, color: color } : opt,
                );
                onChange({ ...config, select_options: newOptions });
                setColorAnchor(null);
              }}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default memo(MultiSelectConfig);
