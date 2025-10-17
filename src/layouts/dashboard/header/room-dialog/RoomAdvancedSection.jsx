import { Button, Collapse, TextField, Typography } from '@mui/material';
import { Settings, ChevronDown, ChevronUp, MessageSquare, Bot, Sparkles, Clock, Tag } from 'lucide-react';
import { memo, useState } from 'react';

const agentInteractionOptions = [
  { value: 'mention_only', label: 'Mention Only', icon: MessageSquare, desc: 'Respond on @mention' },
  { value: 'agents_only', label: 'Agents Only', icon: Bot, desc: 'Only AI interactions' },
  { value: 'always', label: 'Always Active', icon: Sparkles, desc: 'Continuous engagement' },
];

const RoomAdvancedSection = ({ formData, isSubmitting, onInputChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div>
      <Button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        fullWidth
        variant="outlined"
        endIcon={showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        className="normal-case"
        sx={{
          py: 2,
          justifyContent: 'space-between',
          borderRadius: '16px',
          borderWidth: '2px',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderWidth: '2px',
            borderColor: 'rgba(0, 0, 0, 0.12)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
          '.dark &': {
            borderColor: 'rgba(255, 255, 255, 0.06)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            },
          },
        }}
      >
        <div className="flex items-center gap-2">
          <Settings size={20} strokeWidth={2.5} />
          <span>Advanced Settings</span>
        </div>
      </Button>

      <Collapse in={showAdvanced} timeout={300}>
        <div className="flex flex-col gap-6 mt-6 p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border-2 border-black/[0.06] dark:border-white/[0.06]">
          <div>
            <Typography variant="body2" className="mb-3 font-bold text-sm">
              Agent Interaction Mode
            </Typography>
            <div className="grid grid-cols-3 gap-3">
              {agentInteractionOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.policy.agent_interaction === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    onClick={() => onInputChange('policy.agent_interaction')({ target: { value: option.value } })}
                    disabled={isSubmitting}
                    variant="outlined"
                    className="normal-case"
                    sx={{
                      py: 2,
                      px: 1.5,
                      borderRadius: '14px',
                      flexDirection: 'column',
                      gap: 1,
                      minHeight: '90px',
                      borderWidth: '2px',
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected
                        ? 'rgba(139, 92, 246, 0.08)'
                        : 'transparent',
                      borderColor: isSelected
                        ? 'rgb(139, 92, 246)'
                        : 'rgba(0, 0, 0, 0.06)',
                      color: isSelected ? 'rgb(139, 92, 246)' : 'currentColor',
                      '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: isSelected
                          ? 'rgba(139, 92, 246, 0.12)'
                          : 'rgba(0, 0, 0, 0.03)',
                        borderColor: isSelected
                          ? 'rgb(139, 92, 246)'
                          : 'rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-1px)',
                      },
                      '.dark &': {
                        backgroundColor: isSelected
                          ? 'rgba(167, 139, 250, 0.12)'
                          : 'transparent',
                        borderColor: isSelected
                          ? 'rgb(167, 139, 250)'
                          : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? 'rgb(167, 139, 250)' : 'currentColor',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? 'rgba(167, 139, 250, 0.16)'
                            : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected
                            ? 'rgb(167, 139, 250)'
                            : 'rgba(255, 255, 255, 0.12)',
                        },
                      },
                    }}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold leading-tight">{option.label}</span>
                      <span className="text-[0.65rem] opacity-60 text-center leading-tight">
                        {option.desc}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                <Typography variant="body2" className="font-bold text-sm">
                  Agent Timeout (s)
                </Typography>
              </div>
              <TextField
                type="number"
                value={formData.policy.agent_timeout || ''}
                onChange={onInputChange('policy.agent_timeout')}
                fullWidth
                disabled={isSubmitting}
                placeholder="Default"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    borderRadius: '14px',
                    borderWidth: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: 'rgba(0, 0, 0, 0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                      borderColor: 'rgb(139, 92, 246)',
                    },
                    '.dark &': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgb(167, 139, 250)',
                      },
                    },
                  },
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                <Typography variant="body2" className="font-bold text-sm">
                  External ID
                </Typography>
              </div>
              <TextField
                value={formData.external_id}
                onChange={onInputChange('external_id')}
                fullWidth
                disabled={isSubmitting}
                placeholder="Optional"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    borderRadius: '14px',
                    borderWidth: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: 'rgba(0, 0, 0, 0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                      borderColor: 'rgb(139, 92, 246)',
                    },
                    '.dark &': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgb(167, 139, 250)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default memo(RoomAdvancedSection);
