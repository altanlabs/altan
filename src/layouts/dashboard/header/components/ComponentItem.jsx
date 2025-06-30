import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';

import DeleteDialog from '../../../../components/dialogs/DeleteDialog';
import Iconify from '../../../../components/iconify';
import ComponentDialog from '../../../../pages/dashboard/altaners/components/AltanerComponentDialog';
import { deleteAltanerComponentById } from '../../../../redux/slices/altaners';

const ComponentItem = memo(({ component, isActive, onClick, altanerId }) => {
  const dispatch = useDispatch();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setIsSubmitting(true);
    let deleteAction;
    if (altanerId) {
      deleteAction = dispatch(deleteAltanerComponentById(component.id));
    } else {
      deleteAction = Promise.resolve();
    }

    deleteAction
      .then(() => {
        setIsDeleteDialogOpen(false);
      })
      .catch((error) => {
        console.error('Failed to delete component:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <div
        className={`
          group relative flex items-center justify-between
          px-4 py-3 cursor-pointer
          transition-all duration-200 ease-out
          ${isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
        `}
        onClick={() => onClick(component.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`
            transition-colors duration-200
            ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
          `}
          >
            <Iconify
              icon={component.icon}
              width={20}
            />
          </div>

          <span
            className={`
            text-sm font-medium
            transition-colors duration-200
            ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}
          `}
          >
            {component.name}
          </span>
        </div>

        <div
          className={`
          flex items-center gap-1
          transition-opacity duration-200
          ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
        `}
        >
          <button
            onClick={handleEdit}
            className="
              p-1.5 rounded-md
              text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-150
            "
            aria-label="Edit component"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="
              p-1.5 rounded-md
              text-gray-500 hover:text-red-600
              dark:text-gray-400 dark:hover:text-red-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-150
            "
            aria-label="Delete component"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {isEditDialogOpen && (
        <ComponentDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          altanerId={altanerId}
          altanerComponentId={component.id}
          projectComponentId={component.id}
        />
      )}

      <DeleteDialog
        openDeleteDialog={isDeleteDialogOpen}
        handleCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
        confirmDelete={confirmDelete}
        isSubmitting={isSubmitting}
        message={`Are you sure you want to delete ${component.name}? This action can't be undone.`}
      />
    </>
  );
});

ComponentItem.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
    params: PropTypes.object,
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  altanerId: PropTypes.string,
};

ComponentItem.displayName = 'ComponentItem';

export default ComponentItem;
