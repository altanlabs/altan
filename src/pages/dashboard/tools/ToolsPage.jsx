import { Stack, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import SearchField from '@components/custom-input/SearchField';
import Iconify from '@components/iconify/Iconify';
// import useFeedbackDispatch from '@hooks/useFeedbackDispatch';

import ToolCard from './ToolCard';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland';
import EmptyContent from '../../../components/empty-content/EmptyContent';
import SkeletonStack from '../../../components/SkeletonStack';
import { CompactLayout } from '../../../layouts/dashboard';
import { getConnections } from '../../../redux/slices/connections';
import { dispatch } from '../../../redux/store';
import { PATH_DASHBOARD } from '../../../routes/paths';
import CreateTool from '../../../sections/@dashboard/spaces/tools/CreateTool';
import Each from '../../../utils/each';

// ----------------------------------------------------------------------

function extractToolsFromConnections(connections) {
  // Ensure connections is an array before calling reduce
  if (!Array.isArray(connections)) {
    console.warn('Expected connections to be an array, but received:', connections);
    return [];
  }

  return connections.reduce((tools, connection) => {
    if (connection.tools && connection.tools.items) {
      return tools.concat(connection.tools.items);
    }
    return tools;
  }, []);
}

// ----------------------------------------------------------------------
export default function ToolsPage() {
  // const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const { connections, initialized, isLoading } = useSelector((state) => state.connections);

  useEffect(() => {
    if (!initialized.connections && !isLoading.connections) {
      dispatch(getConnections());
    }
  }, [initialized.connections, isLoading.connections]);

  const [toolDialog, setToolDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const tools = extractToolsFromConnections(connections) || [];
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.description.toLowerCase().includes(searchTerm),
  );

  return (
    <CompactLayout
      title={'Tools · Altan'}
      breadcrumb={{
        title: 'Tools',
        links: [
          {
            name: 'Assets',
            href: PATH_DASHBOARD.assets.root,
          },
          { name: 'Tools' },
        ],
      }}
      toolbarChildren={
        <SearchField
          placeholder="Search tool..."
          onChange={handleSearchChange}
          value={searchTerm}
        />
      }
    >
      <Stack
        spacing={1}
        sx={{ pb: 12 }}
      >
        {initialized ? (
          filteredTools.length > 0 ? (
            <Each
              of={filteredTools}
              render={(tool, index) => (
                <ToolCard
                  tool={tool}
                  key={index}
                />
              )}
            />
          ) : (
            <EmptyContent
              title="No tools yet :("
              description="Why not create one?"
            />
          )
        ) : (
          <SkeletonStack
            count={5}
            height="90px"
          />
        )}
      </Stack>

      <CreateTool
        isOpen={toolDialog}
        onClose={() => setToolDialog(false)}
      />

      <DynamicIsland>
        <Button
          color="secondary"
          onClick={() => setToolDialog(true)}
          startIcon={
            <Iconify
              icon="lets-icons:add-duotone"
              width={30}
            />
          }
          variant="contained"
          size="large"
        >
          Craft tool
        </Button>
      </DynamicIsland>
    </CompactLayout>
  );
}
