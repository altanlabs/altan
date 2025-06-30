// Material UI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// External
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

// Project
import { RHFSlidingPlaceholderTextField } from '@components/hook-form';

import InteractiveButton from '../../../components/buttons/InteractiveButton';
import CreateWithAI from '../../../components/CreateWithAI.jsx';
import Iconify from '../../../components/iconify';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { createFlow } from '../../../redux/slices/general';
import {
  fetchTemplates,
  selectTemplatesById,
  selectTemplatesIds,
} from '../../../redux/slices/marketplace';

const workflowNames = [
  'Celestial Flow',
  'Stellar Circuit',
  'Nebula Nexus',
  'Orbit Optimizer',
  'Astro Align',
  'Cosmic Pathway',
  'Galactic Conductor',
  'Nova Protocol',
  'Lunar Sequence',
  'Starforge Engine',
  'Eclipse Framework',
  'Quasar Hub',
  'Solar Synergy',
  'Gravity Grid',
  'Pulsar Process',
  'Aurora Node',
  'Void Navigator',
  'Chronos Workflow',
  'Black Hole Efficiency',
  'Hyperdrive Integrator',
  "The Architect's Blueprint",
  'Flow Reloaded',
  'Code Zion',
  'Red Pill Protocol',
  'Agent Smith System',
  'Matrix Mapper',
  'Nebuchadnezzar Navigator',
  "The Oracle's Path",
  'Morpheus Method',
  'Trinity Circuit',
];

// Styled components
const OptionCard = styled(Card)(({ theme, selected, primary }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : primary
      ? `2px solid ${theme.palette.primary.light}20`
      : `1px solid ${theme.palette.divider}`,
  background: primary
    ? `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.light}04)`
    : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: primary
      ? `0 20px 40px ${theme.palette.primary.main}20`
      : theme.customShadows?.z12 || '0 20px 40px rgba(0,0,0,0.1)',
    border: `2px solid ${theme.palette.primary.main}40`,
  },
}));

const TemplateCard = styled(Card)(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.customShadows?.z8 || '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const TemplateImage = styled(CardMedia)({
  height: 140,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
  },
});

const TemplateTitle = styled(Typography)({
  position: 'absolute',
  bottom: 16,
  left: 16,
  color: 'white',
  fontWeight: 'bold',
  zIndex: 1,
});

const StyledIconBox = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  color: 'white',
}));

const CreateWithAIField = ({ name, ...other }) => {
  const { setValue, watch } = useFormContext();
  const value = watch(name);

  return (
    <CreateWithAI
      value={value}
      onChange={(newValue) => setValue(name, newValue)}
      label="Describe what you want your workflow to do"
      {...other}
    />
  );
};

const NewWorkflow = ({ altanerComponentId = null }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const [creationMode, setCreationMode] = useState('scratch'); // 'scratch', 'ai', 'template'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
    },
  });

  const { handleSubmit, watch } = methods;
  const watchedName = watch('name');
  const watchedPrompt = watch('prompt');

  // Get workflow templates from Redux
  const templateIds = useSelector((state) => selectTemplatesIds('workflow')(state));
  const templatesById = useSelector((state) => selectTemplatesById('workflow')(state));
  const templates = templateIds.map((id) => templatesById[id]);

  useEffect(() => {
    dispatch(fetchTemplates('workflow'));
  }, [dispatch]);

  const handleCreateFlow = async (templateId = null) => {
    const data = methods.getValues();
    const completeData = {
      name:
        !data.name || !data.name.length
          ? workflowNames[Math.floor(Math.random() * workflowNames.length)]
          : data.name,
      description: data.description,
      ...(templateId && { templateId }),
    };

    const prompt = data?.prompt || null;

    dispatchWithFeedback(createFlow(completeData, prompt, altanerComponentId), {
      successMessage: 'Workflow created successfully',
      errorMessage: 'There was an error creating the flow: ',
      useSnackbar: true,
      useConsole: { error: true },
    });
  };

  const handleModeSelect = (mode) => {
    setCreationMode(mode);
    if (mode === 'template') {
      setShowTemplates(true);
    }
  };

  const canProceed = () => {
    if (creationMode === 'scratch') return watchedName.length > 0;
    if (creationMode === 'ai') return watchedPrompt.length > 0;
    if (creationMode === 'template') return selectedTemplate !== null;
    return false;
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
    >
      <FormProvider {...methods}>
        {/* Header */}
        <Stack
          spacing={1}
          alignItems="center"
          sx={{ mb: 6 }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Create New Workflow
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, textAlign: 'center' }}
          >
            Choose how you'd like to get started. You can always customize your workflow later.
          </Typography>
        </Stack>

        {/* Creation Mode Selection */}
        {!creationMode && (
          <Grid
            container
            spacing={3}
            sx={{ mb: 4 }}
          >
            {/* Start from Scratch */}
            <Grid
              item
              xs={12}
              md={4}
            >
              <OptionCard
                primary
                onClick={() => handleModeSelect('scratch')}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <StyledIconBox sx={{ mx: 'auto' }}>
                    <Iconify
                      icon="mdi:lightning-bolt"
                      sx={{ fontSize: 32 }}
                    />
                  </StyledIconBox>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Start from Scratch
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Create a blank workflow and build it step by step with our visual editor
                  </Typography>
                </CardContent>
              </OptionCard>
            </Grid>

            {/* Generate with AI */}
            <Grid
              item
              xs={12}
              md={4}
            >
              <OptionCard onClick={() => handleModeSelect('ai')}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <StyledIconBox
                      sx={{
                        mx: 'auto',
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                      }}
                    >
                      <Iconify
                        icon="mdi:magic-staff"
                        sx={{ fontSize: 32 }}
                      />
                    </StyledIconBox>
                    <Chip
                      label="Beta"
                      size="small"
                      color="secondary"
                      sx={{ position: 'absolute', top: -8, right: -16 }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Generate with AI ✨
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Describe what you want and let AI create the workflow structure for you
                  </Typography>
                </CardContent>
              </OptionCard>
            </Grid>

            {/* Use Template */}
            <Grid
              item
              xs={12}
              md={4}
            >
              <OptionCard onClick={() => handleModeSelect('template')}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <StyledIconBox
                    sx={{
                      mx: 'auto',
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                    }}
                  >
                    <Iconify
                      icon="mdi:view-grid-plus"
                      sx={{ fontSize: 32 }}
                    />
                  </StyledIconBox>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Use a Template
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Start with a pre-built template and customize it to fit your needs
                  </Typography>
                </CardContent>
              </OptionCard>
            </Grid>
          </Grid>
        )}

        {/* Creation Forms */}
        {creationMode && (
          <Stack
            spacing={4}
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {/* Scratch Mode */}
            {creationMode === 'scratch' && (
              <Stack spacing={2}>
                <RHFSlidingPlaceholderTextField
                  name="name"
                  placeholders={workflowNames}
                  size="medium"
                />
                <Typography color="text.secondary">
                  Start with a clean slate and build your workflow from scratch. You'll be able to
                  add nodes, connect them, and configure each step to create a custom automation.
                </Typography>
              </Stack>
            )}

            {/* AI Mode */}
            {creationMode === 'ai' && (
              <Stack spacing={3}>
                <RHFSlidingPlaceholderTextField
                  name="name"
                  placeholders={workflowNames}
                  size="medium"
                  enableDoubleClick
                  label="Workflow Name (optional)"
                  variant="filled"
                />
                <CreateWithAIField name="prompt" />
                <Typography color="text.secondary">
                  Describe your workflow in plain English and our AI will generate the structure and
                  connections for you. You can always modify it afterwards.
                </Typography>
              </Stack>
            )}

            {/* Template Mode */}
            {creationMode === 'template' && (
              <Stack spacing={3}>
                <Collapse in={showTemplates}>
                  {templates.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Iconify
                        icon="mdi:package-variant-remove"
                        sx={{ fontSize: 64, opacity: 0.5, mb: 2 }}
                      />
                      <Typography variant="h6">No templates available</Typography>
                      <Typography color="text.secondary">
                        Check back later for new workflow templates
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Choose a template that matches your needs. You can customize it after
                        creation.
                      </Typography>
                      <Grid
                        container
                        spacing={3}
                      >
                        {templates.map((template) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={template.id}
                          >
                            <TemplateCard
                              selected={selectedTemplate === template.id}
                              onClick={() => setSelectedTemplate(template.id)}
                            >
                              <Box sx={{ position: 'relative' }}>
                                <TemplateImage
                                  image={
                                    template.image || '/assets/images/workflow-placeholder.jpg'
                                  }
                                  title={template.name}
                                >
                                  <TemplateTitle variant="h6">{template.name}</TemplateTitle>
                                </TemplateImage>
                              </Box>
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {template.description || 'No description available'}
                                </Typography>
                              </CardContent>
                            </TemplateCard>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Collapse>
              </Stack>
            )}

            {/* Action Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <InteractiveButton
                icon="mdi:check"
                title={
                  creationMode === 'scratch'
                    ? 'Create Workflow'
                    : creationMode === 'ai'
                      ? 'Generate Workflow'
                      : 'Use Selected Template'
                }
                onClick={() => handleCreateFlow(selectedTemplate)}
                disabled={!canProceed() || isSubmitting}
                duration={8000}
                containerClassName="h-[40px] border-transparent"
                borderClassName="h-[60px] w-[220px]"
                enableBorder={true}
                className="p-3"
              />
            </Box>
          </Stack>
        )}
      </FormProvider>
    </Container>
  );
};

export default NewWorkflow;
