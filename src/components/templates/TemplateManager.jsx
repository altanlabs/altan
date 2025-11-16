// TemplateManager.js

import { Copy, Share2, Star, Trash2 } from 'lucide-react';
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
import formatData from '../../utils/formatData';
import { fToNow } from '../../utils/formatTime';
import Iconify from '../iconify/Iconify';
import FormParameter from '../tools/form/FormParameter';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { LoadingButton } from '../ui/loading-button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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
    <div
      className={`group relative rounded-xl border transition-all duration-200 ${
        version.isSelected
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent shadow-lg shadow-amber-500/10'
          : 'border-border/50 bg-card/50 hover:border-border hover:shadow-md backdrop-blur-sm'
      }`}
    >
      {version.isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-amber-500 text-white rounded-full p-1.5 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-foreground truncate">
                {version.name}
              </h4>
              <Badge
                variant={version.isSelected ? 'default' : 'secondary'}
                className="shrink-0"
              >
                v{version.version_string}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {version.description}
            </p>
          </div>

          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {fToNow(version.date_creation)}
          </time>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={handleCopyId}
                  >
                    {copied ? (
                      <Iconify icon="mdi:check" width={16} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Copy Version ID</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={handleShareTemplate}
                  >
                    {shared ? (
                      <Iconify icon="mdi:check" width={16} />
                    ) : (
                      <Share2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Share Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-8 w-8 ${
                      version.isSelected
                        ? 'text-amber-500 cursor-not-allowed opacity-50'
                        : 'hover:bg-amber-500/10 hover:text-amber-500'
                    }`}
                    onClick={onSelectVersion}
                    disabled={version.isSelected}
                  >
                    <Star className={`h-3.5 w-3.5 ${version.isSelected ? 'fill-current' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {version.isSelected ? 'Current Version' : 'Set as Current'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete Version</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
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

  const handleTabChange = useCallback((newValue) => {
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

  const onUpdateTemplate = useCallback(() => {
    const submitHandler = (data) => {
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
    };
    return handleTemplateSubmit(submitHandler)();
  }, [dispatchWithFeedback, handleTemplateSubmit, mode, template?.id]);

  const onPublishVersion = useCallback(() => {
    const submitHandler = (data) => {
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
    };
    return handleVersionSubmit(submitHandler)();
  }, [dispatchWithFeedback, handleVersionSubmit, mode, template?.id, branches, resetVersionForm, selectedBranch]);

  if (!template) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-1 truncate">
                {template.name || 'Unnamed Template'}
              </h2>
              <div className="flex items-center gap-2">
                <code className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-mono">
                  {template.id.slice(0, 12)}...
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 hover:bg-primary/10"
                  onClick={handleCopyId}
                >
                  {copied ? (
                    <Iconify icon="mdi:check" width={14} className="text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {mode !== 'altaner' && (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="shrink-0">
                <TabsList>
                  <TabsTrigger value="versions" className="gap-2">
                    <Iconify icon="mdi:source-branch" width={16} />
                    Versions
                  </TabsTrigger>
                  <TabsTrigger value="general" className="gap-2">
                    <Iconify icon="mdi:store" width={16} />
                    Marketplace
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'general' && (
            <FormProvider {...templateMethods}>
              <div className="max-w-2xl space-y-4">
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
                <div className="flex justify-end pt-4">
                  <LoadingButton
                    onClick={onUpdateTemplate}
                    loading={isSubmitting}
                    disabled={!isTemplateDirty}
                  >
                    Save Changes
                  </LoadingButton>
                </div>
              </div>
            </FormProvider>
          )}

          {activeTab === 'versions' && (
            <FormProvider {...versionMethods}>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {filteredTemplates?.length || 0} {filteredTemplates?.length === 1 ? 'version' : 'versions'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsPublishDialogOpen(true)}
                    className="gap-2 shadow-md"
                    size="default"
                  >
                    <Iconify icon="lucide:git-pull-request-create-arrow" width={18} />
                    Publish New Version
                  </Button>
                </div>

                {filteredTemplates && filteredTemplates.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTemplates.map((version) => (
                      <TemplateItem
                        key={version.id}
                        version={version}
                        mode={mode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted/50 p-4 mb-4">
                      <Iconify icon="mdi:source-branch" width={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No versions yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first version to get started
                    </p>
                    <Button
                      onClick={() => setIsPublishDialogOpen(true)}
                      className="gap-2"
                      variant="outline"
                    >
                      <Iconify icon="lucide:git-pull-request-create-arrow" width={18} />
                      Publish First Version
                    </Button>
                  </div>
                )}
              </div>
            </FormProvider>
          )}
        </div>
      </div>

      {/* Publish New Version Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Iconify icon="lucide:git-pull-request-create-arrow" width={20} className="text-primary" />
              </div>
              Publish New Version
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...versionMethods}>
            <div className="space-y-4 py-2">
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
            </div>
          </FormProvider>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              onClick={onPublishVersion}
              loading={isSubmitting}
              className="gap-2"
            >
              <Iconify icon="mdi:publish" width={16} />
              Publish Version
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(TemplateManager);
