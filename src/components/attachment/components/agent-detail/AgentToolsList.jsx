import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { memo, useState } from 'react';

import Iconify from '../../../iconify/Iconify';

const AgentToolsList = ({ tools = [], agentId, spaceId }) => {
  const [expanded, setExpanded] = useState(false);

  const getToolIcon = (tool) => {
    if (tool.tool?.tool_type === 'client') {
      return 'mdi:desktop-classic';
    }
    return (
      tool.tool?.action_type?.connection_type?.icon ||
      tool.tool?.action_type?.connection_type?.external_app?.icon ||
      'ri:hammer-fill'
    );
  };

  const getToolType = (tool) => {
    if (tool.tool?.tool_type === 'client') {
      return 'Client Tool';
    }
    return tool.tool?.action_type?.connection_type?.name || 'Server Tool';
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        boxShadow: 'none',
        '&:before': { display: 'none' },
        '& .MuiAccordionSummary-root': {
          minHeight: 64,
        },
      }}
    >
      <AccordionSummary sx={{ px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="eva:grid-outline" width={20} sx={{ color: 'success.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Tools
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {tools.length === 0 ? 'No tools configured' : `${tools.length} tool${tools.length !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
          </Box>
          {tools.length > 0 && (
            <Chip
              label={tools.length}
              size="small"
              sx={{
                height: 22,
                minWidth: 22,
                fontSize: '0.7rem',
                bgcolor: 'success.lighter',
                color: 'success.darker',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
        {tools.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              No tools configured for this agent
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {tools.map((tool, index) => (
              <Box
                key={tool.id || index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={getToolIcon(tool)} width={18} sx={{ color: 'text.primary' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tool.tool?.name || 'Unnamed Tool'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                    }}
                  >
                    {getToolType(tool)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(AgentToolsList);

