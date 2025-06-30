import { LoadingButton } from '@mui/lab';
import { Stack, useTheme, IconButton, Tooltip } from '@mui/material';
import React, { useCallback, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { setLicenseKey } from 'survey-core';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';

import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import FormSettingsDialog from './FormSettingsDialog.jsx';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland.jsx';
import Iconify from '../../../components/iconify/Iconify.jsx';
import TemplateDialog from '../../../components/templates/TemplateDialog.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { createTemplate, updateForm } from '../../../redux/slices/general';

import './CustomFormWidgets.jsx';
// import './editor.css';

setLicenseKey(
  'ZG9tYWluczphbHRhbi5haSxsb2NhbGhvc3Q7MD0yMDMwLTA4LTI4LDE9MjAzMC0wOC0yOCwyPTIwMzAtMDgtMjgsMz0yMDMwLTA4LTI4LDQ9MjAzMC0wOC0yOCw1PTIwMzAtMDgtMjgsNj0yMDMwLTA4LTI4LDc9MjAzMC0wOC0yOCw4PTIwMzAtMDgtMjg=',
);

const versionsSelector = (template) => template?.versions?.items;
const selectForms = (state) => state.general.account?.forms || [];

function FormEditor({ formId }) {
  const theme = useTheme();
  const themeMode = theme.palette.mode;
  const history = useHistory();;
  const location = useLocation();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const forms = useSelector(selectForms);
  const currentForm = forms.find((form) => form.id === formId);
  const [creator, setCreator] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const templateSelector = useCallback((state) => currentForm?.template, [currentForm?.template]);
  const onCloseTemplateDialog = useCallback(() => setTemplateDialogOpen(false), []);
  const onClickResponses = useCallback(
    () => history.push(`/forms/${formId}/responses`),
    [formId, history.push],
  );
  const onTogglePreview = useCallback(() => {
    const themeParam = themeMode === 'dark' ? 'dark' : 'light';
    window.open(`https://app.altan.ai/form/${formId}?theme=${themeParam}`, '_blank');
  }, [formId, themeMode]);

  const handleSettingsOpen = useCallback(() => setSettingsDialogOpen(true), []);
  const handleSettingsClose = useCallback(() => setSettingsDialogOpen(false), []);

  useEffect(() => {
    if (currentForm) {
      const creatorOptions = {
        showLogicTab: true,
        showJSONEditorTab: true,
        showThemeTab: false,
        showPreviewTab: false,
        theme: themeMode === 'dark' ? 'default-dark' : 'default',
      };

      const newCreator = new SurveyCreator(creatorOptions);

      const surveyJSON = {
        title: currentForm?.name || 'Untitled Form',
        description: currentForm?.description || 'No description',
        pages: currentForm?.pages || [],
        ...currentForm.meta_data,
      };

      if (surveyJSON.pages.length === 0) {
        surveyJSON.pages = [
          {
            name: 'example',
            elements:
              currentForm?.form_fields?.items.map((field) => ({
                type: field.type || 'text',
                ...field,
              })) || [],
          },
        ];
      }

      newCreator.text = JSON.stringify(surveyJSON);
      newCreator.onModified.add(() => setIsDirty(true));

      setCreator(newCreator);
    }
  }, [currentForm, formId, themeMode]);

  const handleTemplate = useCallback(() => {
    if (!!currentForm?.cloned_template_id) {
      return;
    }
    if (!!currentForm?.template) {
      setTemplateDialogOpen(true);
    } else {
      const data = {
        id: currentForm.id,
        entity_type: 'form',
      };
      dispatchWithFeedback(createTemplate(data), {
        successMessage: 'Form template created successfully',
        errorMessage: 'There was an error creating agent template',
        useSnackbar: true,
      }).then(() => {
        window.location.reload();
      });
    }
  }, [
    currentForm?.cloned_template_id,
    currentForm?.id,
    currentForm?.template,
    dispatchWithFeedback,
  ]);

  const onSubmit = useCallback(() => {
    if (creator) {
      const updatedSurveyJSON = JSON.parse(creator.text);
      const { title, description, pages, ...metaData } = updatedSurveyJSON;
      const updatedForm = {
        name: title,
        description,
        pages: pages.map((page) => ({
          ...page,
          elements: page.elements.map((element) => ({
            ...element, // Spread all element properties
          })),
        })),
      };
      if (Object.keys(metaData).length > 0) {
        updatedForm.meta_data = metaData;
      }
      dispatchWithFeedback(updateForm(formId, updatedForm), {
        useSnackbar: true,
        successMessage: 'Form saved successfully',
        errorMessage: 'Could not save form',
      }).then(() => {
        setIsDirty(false);
      });
    }
  }, [creator, formId, dispatchWithFeedback]);

  const showIsland = new URLSearchParams(location.search).get('island') !== 'false';

  useEffect(() => {
    // Remove any existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme');
    // Add the current theme class
    document.body.classList.add(`${themeMode}-theme`);

    // Update creator theme if it exists
    if (creator) {
      creator.theme = themeMode === 'dark' ? 'default-dark' : 'default';
    }
  }, [themeMode, creator]);

  if (!currentForm || !creator) return null;

  return (
    <>
      <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
        <SurveyCreatorComponent creator={creator} />
      </div>

      {showIsland && (
        <DynamicIsland>
          <Stack direction="row">
            <Tooltip title="Preview form">
              <IconButton
                color="secondary"
                onClick={onTogglePreview}
              >
                <Iconify icon="carbon:view-filled" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View responses">
              <IconButton
                color="warning"
                onClick={onClickResponses}
              >
                <Iconify icon="fluent:form-48-filled" />
              </IconButton>
            </Tooltip>
            {!currentForm.cloned_template_id && (
              <TemplateDialog
                open={templateDialogOpen}
                onClose={onCloseTemplateDialog}
                mode="agent"
                templateSelector={templateSelector}
                versionsSelector={versionsSelector}
              />
            )}
            {!currentForm.cloned_template_id && (
              <Tooltip title={!!currentForm?.template ? 'View versions' : 'Create checkpoint'}>
                <IconButton
                  id="marketplace"
                  color="info"
                  onClick={handleTemplate}
                >
                  <Iconify icon="lucide:git-branch-plus" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Form settings">
              <IconButton
                color="inherit"
                onClick={handleSettingsOpen}
              >
                <Iconify icon="material-symbols:settings" />
              </IconButton>
            </Tooltip>
            <LoadingButton
              startIcon={<Iconify icon="dashicons:saved" />}
              color="primary"
              variant="soft"
              loading={isSubmitting}
              onClick={onSubmit}
              // disabled={!isDirty}
            >
              Save
            </LoadingButton>
          </Stack>
        </DynamicIsland>
      )}
      <FormSettingsDialog
        open={settingsDialogOpen}
        onClose={handleSettingsClose}
        formId={currentForm.id}
      />
    </>
  );
}

export default memo(FormEditor);
