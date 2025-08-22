import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { Space } from '../../../../sections/@dashboard/spaces';

function ToolsTab({ agentData, onFieldChange }) {
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Tools Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Tools
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Configure the action space that your agent can access and use to provide enhanced functionality.
            </Typography>

            <Space 
              navigate={() => console.log('navigated')}
              spaceId={agentData?.space_id}
              isPreview={true}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

ToolsTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(ToolsTab);
