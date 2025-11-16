import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { memo, useMemo, useCallback, useState } from 'react';

import Iconify from '../../../../components/iconify';
import IconRenderer from '../../../../components/icons/IconRenderer';
import ConnectionSelectorAutocomplete from '../../../../components/tools/ConnectionSelectorAutocomplete';
import VirtualizedList from '../../../../components/virtualized/VirtualizedList';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import {
  selectAccountConnections,
  selectAccountConnectionsInitialized,
} from '../../../../redux/slices/connections';
import { createToolLink } from '../../../../redux/slices/spaces';
import { useSelector } from '../../../../redux/store.ts';

function extractToolsFromConnections(connections) {
  if (!Array.isArray(connections)) {
    console.warn('Invalid connections type: expected an array', connections);
    return [];
  }

  return connections.reduce((tools, connection) => {
    if (connection.tools && connection.tools.items) {
      return tools.concat(connection.tools.items);
    }
    return tools;
  }, []);
}

function extractConnectionInfo(tool, connections) {
  const toolConnectionId = tool.connection_id;
  return connections.find((conn) => conn.id === toolConnectionId);
}

const selectCurrentSpace = (state) => state.spaces.current;

const SelectExistingTool = ({ onClose }) => {
  const initialized = useSelector(selectAccountConnectionsInitialized);
  const connections = useSelector(selectAccountConnections);
  const current = useSelector(selectCurrentSpace);

  const [dispatchWithFeedback] = useFeedbackDispatch();

  const tools = useMemo(() => extractToolsFromConnections(connections) || [], [connections]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null); // Track selected connection

  const handleToggle = useCallback(
    (id) => {
      if (selectedTools.includes(id)) {
        setSelectedTools((prev) => prev.filter((item) => item !== id));
      } else {
        setSelectedTools((prev) => [...prev, id]);
      }
    },
    [selectedTools],
  );

  const handleCreateToolLinks = useCallback(() => {
    selectedTools.forEach((tool) =>
      dispatchWithFeedback(createToolLink(tool), {
        errorMessage: 'Error creating link to tool:',
        useSnackbar: { error: true },
      }),
    );
    setSelectedTools([]);
    if (onClose) onClose();
  }, [dispatchWithFeedback, selectedTools, onClose]);

  const filteredTools = useMemo(
    () =>
      tools.filter((tool) => {
        const matchesSearch =
          tool?.name?.toLowerCase().includes(searchTerm) ||
          tool?.description?.toLowerCase().includes(searchTerm);
        const matchesConnection =
          !selectedConnection || tool.connection_id === selectedConnection.id;
        return matchesSearch && matchesConnection;
      }),
    [searchTerm, selectedConnection, tools],
  );

  const renderExec = useCallback(
    (index, tool) => {
      const connectionType = extractConnectionInfo(tool, connections).connection_type;
      return (
        <>
          <ListItemButton
            key={`navigation_tool_child_${tool.id}`}
            // sx={{ py: 0.25 }}
            onClick={() => handleToggle(tool.id)}
            disabled={!!(current?.children?.tools?.map((t) => t.id) ?? []).includes(tool.id)}
          >
            <Stack
              spacing={1}
              direction="row"
            >
              <Checkbox checked={selectedTools.includes(tool.id)} />

              <Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                >
                  <Tooltip
                    arrow
                    followCursor
                    title={connectionType.name}
                  >
                    <Badge>
                      <IconRenderer
                        icon={connectionType.icon}
                        size={12}
                      />
                    </Badge>
                    {/* <Chip
                      size="small"
                      icon={(
                        <IconRenderer
                          icon={connectionType.icon}
                          size={12}
                        />
                      )}
                      sx={{
                        fontSize: '0.6rem',
                        height: 20
                      }}
                      label={truncate(connectionType.name, { length: 20 })}
                    /> */}
                  </Tooltip>
                  <Typography
                    noWrap
                    variant="subtitle"
                    sx={{ maxWidth: 360, cursor: 'pointer' }}
                  >
                    {tool?.name || 'tool'}
                  </Typography>
                </Stack>
                {!!tool?.description && (
                  <Typography
                    noWrap
                    variant="caption"
                    sx={{
                      maxWidth: 360,
                      cursor: 'pointer',
                      opacity: 0.8,
                    }}
                  >
                    {tool.description}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </ListItemButton>
          <Divider sx={{ p: 0, py: 0, m: 0, my: 0 }} />
        </>
      );
    },
    [connections, current?.children?.tools, handleToggle, selectedTools],
  );

  return (
    <>
      <Stack
        direction="row"
        justifyContent="center"
        spacing={1}
        paddingY={1}
      >
        <TextField
          // inputRef={setTextInputRef}
          placeholder="Search tool..."
          // value={searchTerm}
          // onChange={(e) => updatePanelState({ searchTerm: e.target.value })}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        {!!selectedTools.length && (
          <Button
            fullWidth
            variant="soft"
            color="inherit"
            startIcon={<Iconify icon="entypo:tools" />}
            onClick={handleCreateToolLinks}
            sx={{ width: 250, textTransform: 'none' }}
            disabled={!selectedTools.length}
          >
            Add {selectedTools.length} tools
          </Button>
        )}
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'sticky',
          top: 0,
          // backgroundColor: '#FFFFFF55',
          zIndex: 100,
        }}
        alignItems="center"
      >
        <ConnectionSelectorAutocomplete
          connections={connections}
          connection={selectedConnection}
          onChange={(event, newValue) => {
            setSelectedConnection(newValue);
          }}
        />
      </Stack>
      <VirtualizedList
        listId="existing-tools"
        data={filteredTools}
        renderItem={renderExec}
        initialized={initialized}
        noDataMessage="No tools found. Click on create."
      />
    </>
  );
};

export default memo(SelectExistingTool);
