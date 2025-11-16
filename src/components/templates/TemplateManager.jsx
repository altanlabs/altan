// TemplateManager.js

import {
  LoadingButton,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import {
  createTemplateVersion,
  deleteTemplateVersion,
  markTemplateVersionAsSelected,
  updateTemplate,
} from '../../redux/slices/general/index.ts';
import { dispatch, useSelector } from '../../redux/store.ts';
import { bgBlur } from '../../utils/cssStyles';
import formatData from '../../utils/formatData';
import { fToNow } from '../../utils/formatTime';
import CustomDialog from '../dialogs/CustomDialog';
import Iconify from '../iconify/Iconify';
import FormParameter from '../tools/form/FormParameter';

const TemplateItem = memo(({ version }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(version.id);
    setCopied(version.id);
    setTimeout(() => setCopied(false), 2000);
  }, [version.id]);

  const handleShareTemplate = useCallback(() => {
    const shareLink = `https://www.altan.ai/flows?template=${version.id}`;
    navigator.clipboard.writeText(shareLink);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [version.id]);

  const onSelectVersion = useCallback(
    () => dispatch(markTemplateVersionAsSelected(version.template_id, version.id)),
    [version.id, version.template_id],
  );

  const onDelete = useCallback(() => dispatch(deleteTemplateVersion(version.id)), [version.id]);

  return (
    <TimelineItem>
      <TimelineOppositeContent sx={{ flex: 0.2 }}>
        <Typography
          variant="caption"
          color="textSecondary"
        >
          {fToNow(version.date_creation)}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={version.isSelected ? 'warning' : 'grey'}>
          <Iconify
            icon={version.isSelected ? 'mdi:star' : 'mdi:git'}
            width={20}
            color={version.isSelected ? 'gold' : 'inherit'}
          />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'medium' }}
          >
            {version.name}
          </Typography>
          {version.isSelected && (
            <Iconify
              icon="mdi:star"
              width={20}
              color="gold"
            />
          )}
          <Chip
            label={`v${version.version_string}`}
            size="small"
            color="primary"
          />
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {version.description}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          mt={1}
        >
          <Tooltip title="Copy Version ID">
            <IconButton
              size="small"
              onClick={handleCopyId}
            >
              <Iconify
                icon={copied ? 'mdi:check' : 'mdi:content-copy'}
                width={16}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Share Link">
            <IconButton
              size="small"
              onClick={handleShareTemplate}
            >
              <Iconify
                icon={shared ? 'mdi:check' : 'mdi:share-variant'}
                width={16}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Set as Selected Version">
            <IconButton
              size="small"
              onClick={onSelectVersion}
              disabled={version.isSelected}
            >
              <Iconify
                icon="mdi:star"
                width={16}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Version">
            <IconButton
              size="small"
              onClick={onDelete}
            >
              <Iconify
                icon="mdi:delete"
                width={16}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
});

TemplateItem.displayName = 'TemplateItem';

const BRANCH_SCHEMA = (branches) => ({
  'x-override-label': 'Select your branch...',
  type: 'string',
  description: 'Select the branch.',
  enum: [...new Set(['master', ...branches])],
  default: 'master',
  'x-nested-in': 'version',
  'x-disable-free-text': true,
});

const CREATE_VERSION_SCHEMA = {
  type: 'object',
  description: 'Schema for creating a new template version.',
  properties: {
    version: {
      'x-ignore-ui': true,
      type: 'object',
      properties: {},
    },
    version_type: {
      'x-disable-free-text': true,
      'x-override-label': 'Choose the versioning mode...',
      type: 'string',
      description: 'The type of version increment.',
      enum: ['major', 'minor', 'patch', 'prerelease'],
      'x-nested-in': 'version',
      enumDescriptions: [
        'Increments the major version. Introduces incompatible API changes.',
        'Increments the minor version. Adds functionality in a backward-compatible manner.',
        'Increments the patch version. Makes backward-compatible bug fixes.',
        'Creates a prerelease version. Indicates unstable changes that might not satisfy the intended compatibility requirements.',
      ],
    },
    prerelease: {
      type: 'string',
      'x-disable-free-text': true,
      'x-hide-label': true,
      'x-nested-in': 'version',
      'x-conditional-render': {
        version_type: 'prerelease',
      },
      minLength: 1,
      pattern: '^[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*$',
      description:
        "Optional prerelease identifier (e.g., 'alpha', 'beta.1'). Must consist of alphanumeric characters and hyphens, separated by dots.",
    },
    name: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      description: 'The name of the template version.',
      'x-conditional-render': {
        '@not': {
          version_type: [null, undefined, ''],
        },
      },
    },
    description: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      description: 'A description of the template version.',
      'x-conditional-render': {
        '@not': {
          name: [null, undefined, ''],
        },
      },
    },
  },
  required: ['version_type'],
};

const TEMPLATE_SCHEMA = {
  type: 'object',
  description: 'Schema for updating a template.',
  properties: {
    name: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      description: 'The name of the template.',
    },
    description: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      description: 'A description of the template.',
    },
    is_visible: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'boolean',
      title: 'Visible in Marketplace',
      description: 'Whether the template is visible in the marketplace.',
    },
  },
  required: ['name'],
};

// Schema specifically for agent templates with category
const AGENT_TEMPLATE_SCHEMA = {
  type: 'object',
  description: 'Schema for updating an agent template.',
  properties: {
    name: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      description: 'The name of the template.',
    },
    description: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      description: 'A description of the template.',
    },
    is_visible: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'boolean',
      title: 'Visible in Marketplace',
      description: 'Whether the template is visible in the marketplace.',
    },
    category: {
      'x-hide-label': true,
      'x-disable-free-text': true,
      type: 'string',
      title: 'Category',
      description: 'The category for this agent template.',
      enum: ['official', 'personal', 'sales', 'marketing', 'finance', 'operations', 'support'],
      'x-enum-labels': [
        'Official',
        'Personal',
        'Sales',
        'Marketing',
        'Finance',
        'Operations',
        'Support',
      ],
    },
  },
  required: ['name'],
};

const sortTemplatesByDateCreation = (a, b) => {
  return new Date(b.date_creation) - new Date(a.date_creation);
};

const defaultVersionsSelector = (template) => template?.versions;

const TemplateManager = ({
  mode = 'agent',
  templateSelector,
  versionsSelector = null,
  onClose = null,
  actionButtonsLayout = 'bottom',
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('versions');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const template = useSelector(templateSelector);

  const handleCopyId = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(template?.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [template?.id]);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const templateMethods = useForm({
    defaultValues: {
      name: '',
      description: '',
      is_visible: false,
    },
  });

  const versionMethods = useForm({
    defaultValues: {
      branch: 'master',
      version_type: 'patch', // Set default version_type
      name: '',
      description: '',
    },
  });

  const {
    handleSubmit: handleTemplateSubmit,
    formState: { isDirty: isTemplateDirty },
    reset: resetTemplateForm,
  } = templateMethods;

  const {
    handleSubmit: handleVersionSubmit,
    control: versionControl,
    reset: resetVersionForm,
  } = versionMethods;

  const selectedBranch = useWatch({
    control: versionControl,
    name: 'branch',
  });

  useEffect(() => {
    if (template) {
      const formData = {
        name: template.name || '',
        description: template.description || '',
        is_visible: template.is_visible || false,
      };

      // For agent templates, include category from top-level field
      if (mode === 'agent') {
        formData.category = template.category || '';
      }

      resetTemplateForm(formData);
    }
  }, [template, resetTemplateForm, mode]);

  // Set default values when opening the publish dialog
  useEffect(() => {
    if (isPublishDialogOpen) {
      versionMethods.reset({
        branch: selectedBranch || 'master',
        version_type: 'patch',
        name: 'Fixed stuff',
        description: '',
      });
    }
  }, [isPublishDialogOpen, selectedBranch, template.name, versionMethods]);

  const sortedTemplates = useMemo(() => {
    const versions = template && (versionsSelector || defaultVersionsSelector)(template);
    if (!versions?.length) return null;
    return versions
      .map((v) => ({
        ...v,
        isSelected: template.selected_version_id === v.id,
      }))
      .sort(sortTemplatesByDateCreation);
  }, [template, versionsSelector]);

  const branches = useMemo(() => {
    if (!sortedTemplates?.length) return [];
    const branchesSet = new Set(sortedTemplates.map((v) => v.branch));
    return Array.from(branchesSet);
  }, [sortedTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!sortedTemplates) return null;
    return sortedTemplates.filter((t) => t.branch === selectedBranch);
  }, [sortedTemplates, selectedBranch]);

  const onUpdateTemplate = useCallback(
    handleTemplateSubmit((data) => {
      if (!template?.id) return;
      const schema = mode === 'agent' ? AGENT_TEMPLATE_SCHEMA : TEMPLATE_SCHEMA;
      let formattedData = formatData(data, schema.properties);

      // For agent templates, ensure category is passed as a top-level field, not in metadata
      if (mode === 'agent' && data.category) {
        formattedData = {
          ...formattedData,
          category: data.category,
        };
        // Remove category from meta_data if it exists
        if (formattedData.meta_data?.category) {
          const { category, ...restMetaData } = formattedData.meta_data;
          formattedData.meta_data = restMetaData;
        }
      }

      dispatchWithFeedback(updateTemplate(template.id, formattedData), {
        successMessage: `Template ${data.name} was updated successfully`,
        errorMessage: `Could not update ${mode} template:`,
        useSnackbar: {
          error: true,
        },
      });
    }),
    [dispatchWithFeedback, mode, template?.id],
  );

  const onPublishVersion = useCallback(
    handleVersionSubmit((data) => {
      if (!template?.id) return;
      const formattedData = formatData(
        {
          ...data,
          branch: selectedBranch || 'master',
        },
        {
          ...CREATE_VERSION_SCHEMA.properties,
          branch: BRANCH_SCHEMA(branches),
        },
      );
      dispatchWithFeedback(createTemplateVersion(template.id, formattedData), {
        successMessage: (version) =>
          `Version ${version.version} for ${data.name} was created successfully`,
        errorMessage: `Could not create ${mode} template version:`,
        useSnackbar: {
          error: true,
        },
      }).then(() => {
        setIsPublishDialogOpen(false);
        resetVersionForm();
      });
    }),
    [dispatchWithFeedback, mode, template?.id, branches, resetVersionForm, selectedBranch],
  );

  if (!template) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{ height: '100%', position: 'relative', p: 2 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ...bgBlur({ opacity: 0.5 }), p: 2, borderRadius: 2 }}
      >
        <Typography variant="h6">
          Template: {template.name || 'Unnamed'}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{ mr: 1 }}
            >
              ID: {template.id.slice(0, 8)}...
            </Typography>
            <IconButton
              size="small"
              onClick={handleCopyId}
            >
              <Iconify
                icon={copied ? 'mdi:check' : 'mdi:content-copy'}
                width={16}
              />
            </IconButton>
          </Box>
        </Typography>
        {mode !== 'altaner' && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="template sections"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label="Versions"
              value="versions"
              icon={
                <Iconify
                  icon="mdi:source-branch"
                  width={20}
                />
              }
              iconPosition="start"
            />
            <Tab
              label="Marketplace"
              value="general"
              icon={
                <Iconify
                  icon="mdi:store"
                  width={20}
                />
              }
              iconPosition="start"
            />
          </Tabs>
        )}
      </Stack>

      {activeTab === 'general' && (
        <FormProvider {...templateMethods}>
          <Stack spacing={2}>
            {Object.entries(
              (mode === 'agent' ? AGENT_TEMPLATE_SCHEMA : TEMPLATE_SCHEMA).properties,
            ).map(([key, fieldSchema]) => {
              const schema = mode === 'agent' ? AGENT_TEMPLATE_SCHEMA : TEMPLATE_SCHEMA;
              const required = schema.required.includes(key);
              return (
                <FormParameter
                  key={key}
                  fieldKey={key}
                  name={key}
                  schema={fieldSchema}
                  required={required}
                />
              );
            })}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton
                variant="contained"
                onClick={onUpdateTemplate}
                loading={isSubmitting}
                disabled={!isTemplateDirty}
              >
                Save Changes
              </LoadingButton>
            </Box>
          </Stack>
        </FormProvider>
      )}

      {activeTab === 'versions' && (
        <FormProvider {...versionMethods}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* {branches.length > 0 && (
                <FormParameter
                  fieldKey="branch"
                  name="branch"
                  schema={BRANCH_SCHEMA(branches)}
                  required={false}
                />
              )} */}
              <Button
                variant="contained"
                startIcon={<Iconify icon="lucide:git-pull-request-create-arrow" />}
                onClick={() => setIsPublishDialogOpen(true)}
                sx={{
                  background: (theme) => theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    background: (theme) => theme.palette.primary.dark,
                  },
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: (theme) => theme.customShadows.primary,
                }}
              >
                Publish New Version
              </Button>
            </Stack>

            {filteredTemplates && filteredTemplates.length > 0 ? (
              <Timeline>
                {filteredTemplates.map((version) => (
                  <TemplateItem
                    key={version.id}
                    version={version}
                    mode={mode}
                  />
                ))}
              </Timeline>
            ) : (
              <Typography align="center">No versions found</Typography>
            )}
          </Stack>
        </FormProvider>
      )}

      {/* Publish New Version Dialog */}
      <CustomDialog
        dialogOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Publish New Version</DialogTitle>
        <DialogContent>
          <FormProvider {...versionMethods}>
            <Stack spacing={2}>
              {Object.entries(CREATE_VERSION_SCHEMA.properties).map(([key, fieldSchema]) => {
                const required = CREATE_VERSION_SCHEMA.required.includes(key);
                return (
                  <FormParameter
                    key={key}
                    fieldKey={key}
                    name={key}
                    schema={fieldSchema}
                    required={required}
                  />
                );
              })}
            </Stack>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPublishDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={onPublishVersion}
            loading={isSubmitting}
          >
            Publish
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      {/* {onClose && (
        <Box sx={{ position: 'sticky', bottom: 0, p: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      )} */}
    </Stack>
  );
};

export default memo(TemplateManager);
