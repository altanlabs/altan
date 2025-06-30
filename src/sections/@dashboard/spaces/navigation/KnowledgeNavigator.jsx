import {
  Stack,
  Typography,
  Checkbox,
  Button,
  Drawer,
  List,
  ListItemButton,
  Divider,
  IconButton,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { memo, useState, useMemo, useCallback } from 'react';

import FileThumbnail from '../../../../components/file-thumbnail/FileThumbnail';
import Iconify from '../../../../components/iconify/Iconify';
import Label from '../../../../components/label/Label';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import useResponsive from '../../../../hooks/useResponsive';
import ConnectionDialog from '../../../../pages/dashboard/tools/ConnectionDialog';
import { createKnowledgeLink, createResourceLink } from '../../../../redux/slices/spaces';
import { useSelector } from '../../../../redux/store';

function getStatusColor(status) {
  if (status === 'uploaded') {
    return 'secondary';
  } else if (status === 'learning') {
    return 'info';
  } else if (status === 'learned') {
    return 'success';
  } else {
    return 'error';
  }
}

function KnowledgeType({ value, onChange, ...other }) {
  return (
    <ToggleButtonGroup
      size="large"
      color="primary"
      value={value}
      exclusive
      onChange={onChange}
      {...other}
    >
      <ToggleButton value="files">
        <Iconify icon="carbon:ibm-watson-knowledge-studio" />
      </ToggleButton>
      <ToggleButton value="data">
        <Iconify icon="bxs:data" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export const FileCard = ({ file }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      onClick={() => onClick(file.id)}
    >
      <FileThumbnail file={file?.type || file?.file_type || 'file'} />
      <Typography
        noWrap
        variant="inherit"
        sx={{ maxWidth: 360, cursor: 'pointer' }}
      >
        {file?.name || file?.file_name || 'File'}
      </Typography>
      <Label
        color={getStatusColor(file?.status || 'processing')}
        startIcon={
          file?.status === 'learning' || file?.status === 'processing' ? (
            <Iconify icon="line-md:loading-twotone-loop" />
          ) : null
        }
      >
        {file?.status || 'processing'}
      </Label>
    </Stack>
  );
};

const DataSource = ({ dataSource, connection }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      onClick={() => onClick(dataSource.id)}
    >
      <ConnectionDialog connection={connection} />
      <Typography
        noWrap
        variant="inherit"
        sx={{ maxWidth: 360, cursor: 'pointer' }}
      >
        {dataSource.name}
      </Typography>
    </Stack>
  );
};

function extractResources(connections) {
  if (!Array.isArray(connections)) {
    console.warn('Invalid connections type: expected an array', connections);
    return [];
  }

  if (!connections?.length) {
    return [];
  }
  return connections.reduce((resources, connection) => {
    if (connection.resources && connection.resources.items) {
      return resources.concat(connection.resources.items);
    }
    return resources;
  }, []);
}

function findConnection(resource, connections) {
  if (!Array.isArray(connections)) {
    console.error('Invalid connections type: expected an array', connections);
    return null;
  }
  const resourceConId = resource.connection_id;
  return (connections || []).find((conn) => conn.id === resourceConId);
}

const KnowledgeNavigator = ({ knowledgeDrawer, setKnowledgeDrawer, onAddKnowledge }) => {
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const { files, initialized, isLoading } = useSelector((state) => state.files);
  // useEffect(() => {
  //   if (!initialized.files && !isLoading.files) {
  //     dispatch(getFiles());
  //   }
  // }, [dispatch, initialized.files, isLoading.files]);

  const { current } = useSelector((state) => state.spaces);
  const isMobile = useResponsive('down', 'sm');
  const [knowledgeDialog, setKnowledgeDialog] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [knowledgeType, setKnowledgeType] = useState('files');

  // useEffect(() => {
  //   if (!initialized && !isLoading) {
  //     dispatchWithFeedback(getFiles(), {
  //       errorMessage: 'Error retrieving knowledge: ',
  //       useSnackbar: { error: true },
  //     });
  //   }
  // }, []);

  // const handleToggle = useCallback((id) => {
  //   setSelectedKnowledge(prev => {
  //     if (prev.includes(id)) {
  //       return prev.filter(item => item !== id);
  //     } else {
  //       return [...prev, id];
  //     }
  //   });
  // }, [setSelectedKnowledge]);

  const handleToggle = useCallback(
    (item) => {
      setSelectedKnowledge((prev) => {
        const index = prev.findIndex((k) => k.id === item.id);
        if (index > -1) {
          // Item is already selected, remove it
          return prev.filter((k) => k.id !== item.id);
        } else {
          // Item is not selected, add it
          return [...prev, item];
        }
      });
    },
    [setSelectedKnowledge],
  );

  const handleCreateKnowledgeLinks = useCallback(() => {
    selectedKnowledge.forEach((item) => {
      dispatchWithFeedback(
        knowledgeType === 'files' ? createKnowledgeLink(item.id) : createResourceLink(item.id),
        {
          successMessage: 'Knowledge added to space!',
          errorMessage: 'Error creating link: ',
          useSnackbar: true,
        },
      );
    });
    setSelectedKnowledge([]);
    setKnowledgeDrawer(false);
  }, [selectedKnowledge, knowledgeType, setSelectedKnowledge, setKnowledgeDrawer]);

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    return files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm]);

  const renderKnowledgeList = () => {
    const items = filteredFiles;
    return (
      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={`navigation_knowledge_child_${item.id}`}
            sx={{ py: 1 }}
            onClick={() => handleToggle(item)} // Pass the full item object
            disabled={!!current?.knowledge?.items.map((k) => k.id).includes(item.id)}
          >
            <Stack
              spacing={1}
              direction="row"
            >
              <Checkbox checked={selectedKnowledge.includes(item)} />
              <FileCard file={item} />
            </Stack>
          </ListItemButton>
        ))}
      </List>
    );
  };

  const renderHead = (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}
      >
        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
        >
          Knowledge Base
        </Typography>
        <Button
          variant="soft"
          color="info"
          sx={{ mr: 1 }}
          onClick={() => setKnowledgeDialog(true)}
          startIcon={<Iconify icon="gridicons:add" />}
        >
          Add Knowledge
        </Button>
        {!!isMobile && (
          <IconButton onClick={() => setKnowledgeDrawer(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        )}
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ px: 2.5, py: 1 }}
        spacing={2}
      >
        {/* <KnowledgeType value={knowledgeType} onChange={handleKnowledgeTypeChange} /> */}
        <TextField
          sx={{ ml: 2, mt: 1 }}
          size="small"
          fullWidth
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Stack>
    </>
  );

  const renderList = useMemo(
    () => <Scrollbar>{renderKnowledgeList()}</Scrollbar>,
    [filteredFiles, selectedKnowledge, knowledgeType],
  );

  const handleButtonClick = () => {
    if (onAddKnowledge) {
      onAddKnowledge(selectedKnowledge);
      setKnowledgeDrawer(false);
    } else {
      handleCreateKnowledgeLinks();
    }
  };

  return (
    <Drawer
      open={knowledgeDrawer}
      onClose={() => setKnowledgeDrawer(false)}
      anchor="right"
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: { width: 1, maxWidth: 450, pb: 3 },
      }}
    >
      {renderHead}

      <Divider />

      {renderList}
      <Stack
        direction="row"
        justifyContent="center"
        sx={{ pt: 3 }}
      >
        <Button
          fullWidth
          variant="soft"
          color="inherit"
          startIcon={<Iconify icon="uil:link-add" />}
          onClick={handleButtonClick}
          sx={{ width: 250, textTransform: 'none' }}
          disabled={!selectedKnowledge.length}
        >
          Add {selectedKnowledge.length} knowledge links
        </Button>
      </Stack>
    </Drawer>
  );
};

export default memo(KnowledgeNavigator);
