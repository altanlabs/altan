// import { Virtuoso } from 'react-virtuoso';
// import { MoreVert as MoreVertIcon, Description as DescriptionIcon, Share as ShareIcon, Visibility as VisibilityIcon, OpenInNew as OpenInNewIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Box, useTheme, Typography } from '@mui/material';
import React, { useCallback, useState, useMemo, memo, useEffect } from 'react';
import { useHistory } from 'react-router';

import FormEditor from './FormEditor.jsx';
import NoEntityPlaceholder from '../../../components/databases/placeholders/NoEntityPlaceholder.jsx';
import DeleteDialog from '../../../components/dialogs/DeleteDialog.jsx';
import CollapsibleDrawer from '../../../components/drawer/CollapsibleDrawer.jsx';
import QRCodeDialog from '../../../components/QRCodeDialog.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import AltanerComponentDialog from '../../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';
import CreateFormDialog from '../../../pages/dashboard/forms/CreateFormDialog.jsx';
import {
  deleteAccountResource,
  getAccountAttribute,
  selectAccountId,
} from '../../../redux/slices/general';
import { dispatch, useSelector } from '../../../redux/store';

const selectForms = (state) => state.general.account?.forms;

function Forms({ filterIds = [], altanerComponentId = null, ...props }) {
  const history = useHistory();;
  const theme = useTheme();
  const accountId = useSelector(selectAccountId);
  const forms = useSelector(selectForms);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedFormToDelete, setSelectedFormToDelete] = useState(null);
  const [selectedFormQR, setSelectedFormQR] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editAltanerComponentOpen, setEditAltanerComponentOpen] = useState(false);

  const closeShareDialog = useCallback(() => setSelectedFormQR(null), []);
  const openDeleteDialog = useCallback((formId) => setSelectedFormToDelete(formId), []);
  const closeDeleteDialog = useCallback(() => setSelectedFormToDelete(null), []);

  const handleDelete = useCallback(() => {
    if (!selectedFormToDelete) return;
    dispatchWithFeedback(deleteAccountResource('form', selectedFormToDelete.id, null), {
      successMessage: 'Form deleted successfully',
      errorMessage: 'There was an error deleting the form',
      useSnackbar: true,
      useConsole: { success: false, error: true },
    }).then(closeDeleteDialog);
  }, [closeDeleteDialog, dispatchWithFeedback, selectedFormToDelete]);

  const filteredForms = useMemo(() => {
    let filtered = forms;

    if (filterIds?.length === 0 && altanerComponentId) {
      return [];
    }
    if (filterIds?.length > 0) {
      filtered = filtered.filter((form) => filterIds.includes(form.id));
    }

    if (searchQuery) {
      filtered = filtered.filter((form) =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [forms, filterIds, altanerComponentId, searchQuery]);

  useEffect(() => {
    if (filteredForms.length > 0 && !selectedFormId) {
      setSelectedFormId(filteredForms[0].id);
    }
  }, [filteredForms, selectedFormId]);

  const handleEdit = useCallback(
    (form) => {
      setSelectedFormId(form.id);
      if (altanerComponentId) {
        const baseUrl = window.location.pathname.split('/f/')[0];
        history.push(`${baseUrl}/f/${form.id}`, { replace: true });
      } else {
        history.push(`/forms/${form.id}`);
      }
    },
    [history.push, altanerComponentId],
  );

  const handleShare = useCallback(
    (form) => setSelectedFormQR(`https://app.altan.ai/form/${form.id}?theme=${theme.palette.mode}`),
    [theme.palette.mode],
  );
  const handleViewResponses = useCallback(
    (form) => history.push(`/forms/${form.id}/responses`),
    [history.push],
  );

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const contextMenuActions = useMemo(
    () => [
      {
        name: 'Share',
        action: (form) => handleShare(form),
        icon: 'solar:share-bold',
        color: 'primary',
      },
      {
        name: 'View Responses',
        action: (form) => handleViewResponses(form),
        icon: 'material-symbols:format-list-bulleted',
        color: 'inherit',
      },
      {
        name: 'Delete',
        action: (form) => openDeleteDialog(form),
        icon: 'iconamoon:trash-fill',
        color: 'error',
      },
    ],
    [handleShare, handleViewResponses, openDeleteDialog],
  );

  useEffect(() => {
    const path = window.location.pathname;
    const formIdMatch = path.match(/\/f\/([^/]+)/);
    const formIdFromUrl = formIdMatch?.[1];

    if (altanerComponentId && formIdFromUrl && forms.some((form) => form.id === formIdFromUrl)) {
      setSelectedFormId(formIdFromUrl);
    } else if (filteredForms.length > 0 && !selectedFormId) {
      const firstFormId = filteredForms[0].id;
      if (altanerComponentId) {
        const baseUrl = window.location.pathname.split('/f/')[0];
        history.push(`${baseUrl}/f/${firstFormId}`, { replace: true });
      }
      setSelectedFormId(firstFormId);
    }
  }, [forms, selectedFormId, altanerComponentId]);

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);

  const handleOpenEditAltanerComponent = useCallback(() => {
    setEditAltanerComponentOpen(true);
  }, []);

  const handleCloseEditAltanerComponent = useCallback(() => {
    setEditAltanerComponentOpen(false);
  }, []);

  useEffect(() => {
    dispatch(getAccountAttribute(accountId, ['forms']));
  }, [accountId]);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {filteredForms.length > 0 && (
        <CollapsibleDrawer
          isOpen={isDrawerOpen}
          onToggle={toggleDrawer}
          items={filteredForms}
          contextMenuItems={contextMenuActions}
          onItemClick={handleEdit}
          onSearch={(value) => setSearchQuery(value)}
          onCreateClick={handleOpenCreate}
          searchPlaceholder="Search forms..."
          createPlaceholder="Create form"
          selectedId={selectedFormId}
          altanerComponentId={altanerComponentId}
          altanerId={props?.altanerId}
          renderItem={(form) => (
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                color: selectedFormId === form.id ? 'primary.main' : 'text.primary',
              }}
            >
              {form.name}
            </Typography>
          )}
        />
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          height: '100%',
          width: '100%',
        }}
      >
        {selectedFormId ? (
          <FormEditor
            formId={selectedFormId}
            altanerComponentId={altanerComponentId}
          />
        ) : (
          <NoEntityPlaceholder
            title="Build your first form"
            description="Create beautiful typeforms to automate data collection."
            buttonMessage="Create form"
            onButtonClick={handleOpenCreate}
            secondaryButtonMessage="Link existing form"
            secondaryOnButtonClick={handleOpenEditAltanerComponent}
          />
        )}
      </Box>

      {/* Keep dialogs */}
      <DeleteDialog
        openDeleteDialog={!!selectedFormToDelete}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        confirmationText={
          !!selectedFormToDelete
            ? `DELETE ${forms.find((f) => f.id === selectedFormToDelete.id)?.name}`
            : ''
        }
        message="Deleting this form will delete all the responses, are you sure you want to continue?"
      />

      {!!selectedFormQR && (
        <QRCodeDialog
          link={selectedFormQR}
          open={!!selectedFormQR}
          onClose={closeShareDialog}
        />
      )}

      <CreateFormDialog
        open={openCreate}
        handleClose={handleCloseCreate}
        {...(altanerComponentId ? { altanerComponentId } : {})}
      />

      {!!(props?.altanerId && altanerComponentId) && (
        <AltanerComponentDialog
          altanerId={props?.altanerId}
          open={editAltanerComponentOpen}
          onClose={handleCloseEditAltanerComponent}
          altanerComponentId={altanerComponentId}
        />
      )}
    </Box>
  );
}

export default memo(Forms);
