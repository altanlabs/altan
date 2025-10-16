import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { memo, useState } from 'react';

import Iconify from '../../../iconify/Iconify';

const AgentIdsList = ({ agentData }) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(label);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const cropId = (id) => {
    if (!id) return 'N/A';
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  const ids = [
    { label: 'Agent ID', value: agentData?.id },
    { label: 'Account ID', value: agentData?.account_id },
    { label: 'Space ID', value: agentData?.space_id },
    { label: 'ElevenLabs ID', value: agentData?.elevenlabs_id },
  ].filter((item) => item.value); // Only show IDs that exist

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="eva:hash-outline" width={20} sx={{ color: 'text.secondary' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Identifiers
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {ids.length} ID{ids.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
        <Stack spacing={1.5}>
          {ids.map((item) => (
            <Box key={item.label}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                  display: 'block',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {item.label}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontSize: '0.8125rem',
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cropId(item.value)}
                </Typography>
                <Tooltip title={copiedId === item.label ? 'Copied!' : 'Copy'}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(item.value, item.label)}
                    sx={{
                      color: copiedId === item.label ? 'success.main' : 'text.secondary',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Iconify
                      icon={copiedId === item.label ? 'eva:checkmark-outline' : 'eva:copy-outline'}
                      width={16}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(AgentIdsList);

