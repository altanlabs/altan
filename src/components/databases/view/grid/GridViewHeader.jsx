import AddIcon from '@mui/icons-material/Add';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import { TextField, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { loadAllTableRecords } from '../../../../redux/slices/bases';
import CreateRecordDialog from '../../records/CreateRecordDialog';
import RLSSettingsDialog from '../../table/RLSSettingsDialog';

export default function GridViewHeader({
  onQuickFilterChange,
  table,
  isLoading = false,
  paginationInfo,
  paginationGoToFirstPage,
  paginationGoToLastPage,
  paginationGoToNextPage,
  paginationGoToPreviousPage,
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRLSDialog, setShowRLSDialog] = useState(false);
  const dispatch = useDispatch();

  return (
    <div className="flex justify-between items-center gap-2 py-1.5 px-3">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative w-full max-w-[18rem] min-w-[12rem]">
          <TextField
            size="small"
            fullWidth
            placeholder="Search records..."
            onChange={(e) => onQuickFilterChange(e.target.value)}
          />
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 mr-4">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <IconButton
            size="small"
            onClick={paginationGoToFirstPage}
            disabled={paginationInfo.currentPage === 0 || isLoading}
          >
            <FirstPageIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={paginationGoToPreviousPage}
            disabled={paginationInfo.currentPage === 0 || isLoading}
          >
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>

          <div className="flex items-center gap-1 mx-1">
            <span className="text-xs text-gray-600">Page</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{paginationInfo.currentPage + 1}</span>
              <span className="text-xs text-gray-600">of</span>
              <span className="text-sm font-medium">{paginationInfo.totalPages || 1}</span>
            </div>
          </div>

          <IconButton
            size="small"
            onClick={paginationGoToNextPage}
            disabled={
              paginationInfo.currentPage === paginationInfo.totalPages - 1 ||
              !paginationInfo.isLastPageFound ||
              isLoading
            }
          >
            <NavigateNextIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={paginationGoToLastPage}
            disabled={
              !paginationInfo.isLastPageFound ||
              paginationInfo.currentPage === paginationInfo.totalPages - 1 ||
              isLoading
            }
          >
            <LastPageIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip title="RLS Settings">
          <IconButton
            size="small"
            onClick={() => setShowRLSDialog(true)}
            className="text-gray-600 hover:text-blue-600"
            disabled={isLoading}
          >
            <SecurityIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Refresh data">
          <IconButton
            size="small"
            onClick={() => dispatch(loadAllTableRecords(table.id, true))}
            className="text-gray-600 hover:text-blue-600"
            disabled={isLoading}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <button
          onClick={() => setShowCreateDialog(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium
            text-white bg-blue-600 rounded-md hover:bg-blue-700
            transition-colors duration-200
            ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <AddIcon className="w-4 h-4" />
          <span className="hidden md:inline">Add record</span>
        </button>
      </div>

      {showCreateDialog && (
        <CreateRecordDialog
          baseId={table.base_id}
          tableId={table.id}
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {showRLSDialog && (
        <RLSSettingsDialog
          baseId={table.base_id}
          table={table}
          open={showRLSDialog}
          onClose={() => setShowRLSDialog(false)}
        />
      )}
    </div>
  );
}
