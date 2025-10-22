import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Iconify from '../../../iconify';
import { fetchClonedTemplate } from '../../../clone/CloneTemplate';

function AgentInfoDialog({ open, onClose, agentData, onFieldChange, onCopyToClipboard }) {
  const theme = useTheme();
  const [clonedTemplate, setClonedTemplate] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Fetch cloned template when dialog opens and agent has a cloned_template_id
  useEffect(() => {
    if (open && agentData?.cloned_template_id) {
      setIsLoadingTemplate(true);
      fetchClonedTemplate(agentData.cloned_template_id)
        .then((template) => {
          setClonedTemplate(template);
        })
        .catch((error) => {
          console.error('Failed to fetch cloned template:', error);
          setClonedTemplate(null);
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    } else {
      setClonedTemplate(null);
    }
  }, [open, agentData?.cloned_template_id]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Agent Information</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4 }}>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={agentData?.description || ''}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Agent description"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Agent ID
            </Typography>
            <TextField
              fullWidth
              value={agentData?.id || ''}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton
                    onClick={() => onCopyToClipboard(agentData?.id, 'Agent ID')}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon="eva:copy-outline" />
                  </IconButton>
                ),
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              ElevenLabs Agent ID
            </Typography>
            <TextField
              fullWidth
              value={agentData?.elevenlabs_id || 'Not configured'}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
                endAdornment: agentData?.elevenlabs_id ? (
                  <IconButton
                    onClick={() =>
                      onCopyToClipboard(agentData?.elevenlabs_id, 'ElevenLabs ID')
                    }
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon="eva:copy-outline" />
                  </IconButton>
                ) : null,
              }}
            />
          </Box>

          {/* Cloned Template Information */}
          {agentData?.cloned_template_id && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Iconify
                  icon="mdi:package-variant"
                  sx={{ color: 'primary.main', fontSize: '1.25rem' }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: 'primary.main' }}
                >
                  Cloned from Template
                </Typography>
              </Box>

              {isLoadingTemplate ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : clonedTemplate ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Template Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {clonedTemplate.version?.public_details?.name || 'Unknown Template'}
                    </Typography>
                  </Box>
                  {clonedTemplate.version?.version && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        Version
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {clonedTemplate.version.version}
                      </Typography>
                    </Box>
                  )}
                  {clonedTemplate.version?.public_details?.description && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        Template Description
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {clonedTemplate.version.public_details.description}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Template ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          wordBreak: 'break-all',
                          flex: 1,
                        }}
                      >
                        {agentData.cloned_template_id}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          onCopyToClipboard(agentData.cloned_template_id, 'Template ID')
                        }
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon="eva:copy-outline" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Failed to load template details
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      </Dialog>
    );
  }
  
  AgentInfoDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    agentData: PropTypes.object,
    onFieldChange: PropTypes.func.isRequired,
    onCopyToClipboard: PropTypes.func.isRequired,
  };
  
  export default AgentInfoDialog;

