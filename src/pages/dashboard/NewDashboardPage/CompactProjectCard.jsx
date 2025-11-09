import React, { memo, useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { NewAvatarGroup } from '../../../components/avatar-group';
import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import FormDialog from '../../../components/FormDialog';
import Iconify from '../../../components/iconify/Iconify';
import IconRenderer from '../../../components/icons/IconRenderer';
import { deleteAltanerById, updateAltanerById } from '../../../redux/slices/altaners';
import { selectSortedAgents, selectAccount } from '../../../redux/slices/general';

// Selector for agents
const selectAgents = (state) => selectSortedAgents(state) || [];

// Selector for members
const selectMembers = (state) => selectAccount(state)?.members || [];

const CompactProjectCard = ({ altaner }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const agents = useSelector(selectAgents);
  const members = useSelector(selectMembers);
  const [imageError, setImageError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Early return if altaner is invalid
  if (!altaner || typeof altaner !== 'object') {
    return null;
  }

  // Destructure properties from altaner with safe defaults
  const {
    id,
    name = 'Untitled Project',
    icon_url,
    description = '',
    preview_url,
    interface_id,
    is_pinned = false,
    last_modified,
    components,
    user_ids,
  } = altaner || {};

  // Ensure components is always an array
  const safeComponents = Array.isArray(components) ? components : [];
  const safeUserIds = Array.isArray(user_ids) ? user_ids : [];

  // Extract cloud component (base component with cloud_id)
  const cloudComponent = safeComponents.find(
    (comp) => comp && comp.type === 'base' && comp.cloud_id,
  );

  // Extract agents component with ids
  const agentsComponent = safeComponents.find(
    (comp) => comp && comp.type === 'agents' && comp.params?.ids?.length > 0,
  );

  // Get actual agent objects from Redux based on IDs in the component
  const projectAgents = useMemo(() => {
    if (!agentsComponent?.params?.ids?.length || !agents?.length) return [];
    if (!Array.isArray(agentsComponent.params.ids)) return [];
    return agentsComponent.params.ids
      .map((agentId) => agents.find((agent) => agent?.id === agentId))
      .filter(Boolean); // Remove undefined entries
  }, [agentsComponent, agents]);

  // Get actual user objects from Redux based on user_ids in the altaner
  const projectUsers = useMemo(() => {
    if (!safeUserIds?.length || !members?.length) return [];
    return safeUserIds
      .map((userId) => members.find((member) => member?.user?.id === userId))
      .filter(Boolean) // Remove undefined entries
      .map((member) => ({ ...member.user, _type: 'user' })); // Extract user object and mark as user
  }, [safeUserIds, members]);

  // Merge users and agents into a single array for the avatar group
  const projectMembers = useMemo(() => {
    const safeProjectAgents = Array.isArray(projectAgents) ? projectAgents : [];
    const safeProjectUsers = Array.isArray(projectUsers) ? projectUsers : [];
    // Mark agents with a type identifier
    const markedAgents = safeProjectAgents.map((agent) => ({ ...agent, _type: 'agent' }));
    // Users first, then agents
    return [...safeProjectUsers, ...markedAgents];
  }, [projectUsers, projectAgents]);

  const handleClick = useCallback(() => {
    if (!id) return;
    history.push(`/project/${id}`);
  }, [id, history]);

  const handleCloudClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (cloudComponent && cloudComponent.id && id) {
        history.push(`/project/${id}/c/${cloudComponent.id}`);
      }
    },
    [cloudComponent, history, id],
  );

  const handleMemberClick = useCallback(
    (item, e) => {
      e.stopPropagation();
      // Only navigate if it's an agent (not a user)
      if (item?._type === 'agent' && agentsComponent?.id && id && item?.id) {
        history.push(`/project/${id}/c/${agentsComponent.id}/i/${item.id}`);
      }
      // For users, we could add navigation or other functionality later
    },
    [agentsComponent, history, id],
  );

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
    setMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
    setContextMenu(null);
  }, []);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  }, [handleCloseMenu]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) {
      console.error('Cannot delete altaner: missing id');
      return;
    }
    setIsDeleting(true);
    try {
      dispatch(deleteAltanerById(id));
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Failed to delete altaner:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, id, handleCloseDeleteDialog]);

  const editSchema = {
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        default: name,
      },
      description: {
        type: 'string',
        title: 'Description',
        default: description,
      },
      icon_url: {
        type: 'string',
        title: 'Icon URL',
        default: icon_url,
        'x-component': 'IconAutocomplete',
      },
    },
    required: ['name'],
  };

  const handleEdit = useCallback(() => {
    setEditDialogOpen(true);
    handleCloseMenu();
  }, [handleCloseMenu]);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
  }, []);

  const handleConfirmEdit = useCallback(
    async (data) => {
      if (!id) {
        console.error('Cannot update altaner: missing id');
        return;
      }
      try {
        dispatch(updateAltanerById(id, data));
        handleCloseEditDialog();
      } catch (error) {
        console.error('Failed to update altaner:', error);
      }
    },
    [dispatch, handleCloseEditDialog, id],
  );

  const handleTogglePin = useCallback(() => {
    if (!id) {
      console.error('Cannot toggle pin: missing id');
      return;
    }
    try {
      dispatch(updateAltanerById(id, { is_pinned: !is_pinned }));
      handleCloseMenu();
    } catch (error) {
      console.error('Failed to toggle pin status:', error);
    }
  }, [dispatch, id, is_pinned, handleCloseMenu]);

  return (
    <>
      <div
        className="cursor-pointer group w-[280px] sm:w-[320px] flex-shrink-0"
        onContextMenu={handleContextMenu}
      >
        {/* Cover Image */}
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-xl"
          onClick={handleClick}
        >
          {preview_url ? (
            imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-primary/8">
                <IconRenderer
                  icon="mdi:image-off"
                  size={48}
                  className="opacity-50"
                />
              </div>
            ) : (
              <img
                src={preview_url}
                alt={name || 'Project preview'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <img
              src="https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2020/02/Usign-Gradients-Featured-Image.jpg"
              alt={name || 'Project preview'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-center justify-between text-xs w-full min-w-0">
            <div
              className="flex items-center gap-2 min-w-0 flex-1"
              onClick={handleClick}
            >
              {/* Pin indicator */}
              {cloudComponent && (
                <button
                  onClick={handleCloudClick}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  title="Open Cloud"
                >
                  <Iconify
                    icon="material-symbols:cloud"
                    width={16}
                    className="text-primary"
                  />
                </button>
              )}
              {is_pinned && (
                <div className="flex items-center">
                  <Iconify
                    icon="mdi:pin"
                    width={14}
                    className="text-current"
                  />
                </div>
              )}
              {/* Name */}
              <span className="truncate max-w-[140px] font-semibold text-sm">{name}</span>
            </div>

            {/* Component indicators */}
            <div className="flex items-center gap-2">
              {/* Merged avatars group (users and agents) */}
              <NewAvatarGroup
                items={projectMembers}
                size={26}
                limit={6}
                onItemClick={handleMemberClick}
              />
            </div>
          </div>
        </div>
      </div>

      <FormDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        schema={editSchema}
        title="Edit Project"
        description="Update the project details"
        onConfirm={handleConfirmEdit}
      />

      <DeleteDialog
        openDeleteDialog={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        confirmDelete={handleConfirmDelete}
        isSubmitting={isDeleting}
        message={`Are you sure you want to delete "${name}"? This action can't be undone.`}
      />

      {/* Context Menu - Rendered via Portal */}
      {menuOpen &&
        contextMenu &&
        ReactDOM.createPortal(
          <>
            {/* Backdrop to close menu when clicking outside */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={handleCloseMenu}
            />
            {/* Custom Context Menu */}
            <div
              className="fixed z-[9999] min-w-[12rem] rounded-lg border bg-white dark:bg-gray-800 p-1 shadow-xl"
              style={{
                top: `${contextMenu.mouseY}px`,
                left: `${contextMenu.mouseX}px`,
              }}
            >
              <button
                onClick={handleTogglePin}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Iconify
                  icon={is_pinned ? 'mdi:pin-off' : 'mdi:pin'}
                  width={16}
                  className="mr-2"
                />
                {is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={handleEdit}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Iconify
                  icon="mdi:pencil"
                  width={16}
                  className="mr-2"
                />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Iconify
                  icon="mdi:delete"
                  width={16}
                  className="mr-2"
                />
                Delete
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

export default memo(CompactProjectCard);
