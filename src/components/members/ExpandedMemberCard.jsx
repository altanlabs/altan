// ExpandedMemberCard.js
import { Accordion, AccordionSummary, Button, Tooltip, Typography } from '@mui/material';
import { m } from 'framer-motion';
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';

import { useOutsideClick } from '@hooks/use-outside-click';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import useKeyShortcutListener from '../../hooks/useKeyShortcutListener';
import { deleteOrganisationUser } from '../../redux/slices/general/index.ts';
import { useSelector } from '../../redux/store.ts';
import { fToNow } from '../../utils/formatTime';
import { CustomAvatar } from '../custom-avatar';
import DeleteDialog from '../dialogs/DeleteDialog';
import Iconify from '../iconify';

const selectOrgId = (state) => state.general.account?.organisation_id;

function ExpandedMemberCard({ activeUser, id, roles, onClose }) {
  const organisationId = useSelector(selectOrgId);
  const ref = useRef(null);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const handleDelete = useCallback(() => {
    if (!activeUser?.user?.id || activeUser?.type !== 'organisation') {
      return;
    }
    dispatchWithFeedback(deleteOrganisationUser(organisationId, activeUser.user.id), {
      successMessage: 'User deleted from organisation successfully',
      errorMessage: 'Unexpected error: ',
      useSnackbar: false,
      useConsole: true,
    });
  }, [activeUser?.user?.id, activeUser?.type, dispatchWithFeedback, organisationId]);

  const onDeleteClick = useCallback(() => setDeleteDialog(true), []);

  useOutsideClick(ref, onClose);

  useEffect(() => {
    if (activeUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [activeUser]);

  const eventMappings = [
    {
      condition: (event) => event.key === 'Escape',
      handler: onClose,
    },
  ];

  useKeyShortcutListener({
    eventsMapping: eventMappings,
    debounceTime: 300,
    stopPropagation: true,
  });

  return (
    <>
      <div className="fixed inset-0 grid place-items-center top-12 z-[1000]">
        <m.button
          key={`close-button-${id}`}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.05 } }}
          className="flex absolute top-4 right-4 items-center justify-center rounded-full h-8 w-8 shadow-md"
          onClick={onClose}
        >
          <Iconify icon="mdi:close" />
        </m.button>
        <m.div
          layoutId={`card-${activeUser.user.id}-${id}`}
          ref={ref}
          className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl overflow-x-hidden shadow-lg max-h-[75vh]"
        >
          {/* Header */}
          <div className="sticky flex items-center p-6 dark:bg-neutral-800 bg-gray-100">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {/* {activeUser.user.person.first_name[0]}
              {activeUser.user.person.last_name[0]} */}
                <CustomAvatar
                  sx={{ width: 80, height: 80 }}
                  name={activeUser.user.person?.first_name}
                  src={activeUser.user.person?.avatar_url}
                />
              </div>
            </div>
            <div className="ml-4">
              <m.h3
                layoutId={`name-${activeUser.user.id}-${id}`}
                className="text-xl font-semibold text-gray-800 dark:text-gray-200"
              >
                {activeUser.user.person?.first_name} {activeUser.user.person?.last_name}
              </m.h3>
              <m.p
                layoutId={`email-${activeUser.user.id}-${id}`}
                className="text-gray-600 dark:text-gray-400"
              >
                {activeUser.user.email}
              </m.p>
              {/* Type Chip */}
              <div className="mt-2">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {activeUser.type === 'account' ? 'workspace' : activeUser.type}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-scroll">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Roles</h4>
            {/* Role Chips */}
            {/* <div className="flex flex-wrap gap-2 mb-6">
            {activeUser.roles.length > 0 ? (
              activeUser.roles.map((role) => {
                const roleInfo = roles[role.role_id];
                if (roleInfo) {
                  return (
                    <Tooltip
                      key={`name-${activeUser.user?.id}_${role.role_id}`}
                      label={roleInfo.meta_data.description}
                      aria-label={roleInfo.meta_data.description}
                    >
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {roleInfo.name}
                      </span>
                    </Tooltip>
                  );
                }
                return null;
              })
            ) : (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Owner
              </span>
            )}
          </div> */}

            {/* Roles List */}
            {activeUser.roles.length > 0 && (
              <ul className="space-y-4">
                {activeUser.roles.map((role) => {
                  const roleInfo = roles[role.role_id];
                  const roleType = activeUser.type === 'account' ? 'workspace' : activeUser.type;
                  return (
                    <li
                      key={`li-${activeUser.user?.id}_${role.role_id}`}
                      className="flex flex-col p-0 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <Accordion>
                        <h2>
                          <AccordionSummary>
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center">
                                <span className="text-gray-800 dark:text-gray-200 text-lg font-semibold">
                                  {roleInfo ? roleInfo.name : 'Unknown Role'}
                                </span>
                                <span className="ml-2 inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                  {roleType}
                                </span>
                              </div>
                            </div>
                          </AccordionSummary>
                        </h2>
                        <div className="px-4 pb-4">
                          <div className="text-gray-600 dark:text-gray-400">
                            <Typography
                              className="max-w-sm"
                              variant="caption"
                            >
                              {roleInfo?.meta_data?.description ?? ''}
                            </Typography>

                            <Tooltip
                              arrow
                              title={new Date(role.granted_on).toLocaleDateString()}
                            >
                              <p className="w-fit h-fit">Granted On: {fToNow(role.granted_on)}</p>
                            </Tooltip>

                            {role.effective_date && (
                              <Tooltip
                                arrow
                                title={new Date(role.effective_date).toLocaleDateString()}
                              >
                                <p className="w-fit h-fit">
                                  Effective Date: {fToNow(role.effective_date)}
                                </p>
                              </Tooltip>
                            )}
                            {role.expiration_date && (
                              <Tooltip
                                arrow
                                title={new Date(role.expiration_date).toLocaleDateString()}
                              >
                                <p className="w-fit h-fit">
                                  Expiration Date: {fToNow(role.expiration_date)}
                                </p>
                              </Tooltip>
                            )}
                            {role.granted_by_id && <p>Granted By: {role.granted_by_id}</p>}
                            {roleInfo && roleInfo.permissions && (
                              <div>
                                <p>Permissions:</p>
                                <ul className="list-disc list-inside">
                                  {roleInfo.permissions.map((permission) => (
                                    <li key={permission}>{permission}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Button
                              size="small"
                              // onClick={() => alert('Edit Role')}
                              disabled
                            >
                              Edit Role
                            </Button>
                            <Button
                              size="small"
                              // onClick={() => alert('Remove Role')}
                              color="error"
                              disabled
                            >
                              Remove Role
                            </Button>
                          </div>
                        </div>
                      </Accordion>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* : (
              <div className="text-gray-800 dark:text-gray-200">
                <p>This user has no assigned roles and is considered an 'Owner'.</p>
              </div>
            )} */}
            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-4">
              <Button
                disabled
                onClick={() => setIsAddRoleModalOpen(true)}
                className="flex-1 px-4 py-3 text-sm rounded-full"
              >
                Add Role
              </Button>
              <Button
                disabled
                // onClick={() => alert('Send Message')}
                className="flex-1 px-4 py-3 text-sm rounded-full"
              >
                Send Message
              </Button>
              <Button
                disabled
                // onClick={() => alert('View Profile')}
                className="flex-1 px-4 py-3 text-sm rounded-full"
              >
                View Profile
              </Button>
              <Button
                onClick={onDeleteClick}
                color="error"
                className="flex-1 px-4 py-3 text-sm rounded-full"
                disabled={activeUser.type !== 'organisation'}
              >
                Delete User
              </Button>
            </div>
          </div>
        </m.div>
      </div>
      <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={() => setDeleteDialog(false)}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete the user from your organisation?"
      />
    </>
  );
}

export default memo(ExpandedMemberCard);
