import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import React, { useState, memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { cn } from '../../lib/utils';
import { selectTablesByCloudId } from '../../redux/slices/cloud';
import { useSelector } from '../../redux/store.ts';
import CreateTableDialog from '../databases/table/CreateTableDialog.jsx';
import EditTableDrawer from '../databases/table/EditTableDrawer.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

function CloudTableTabs({
  activeTableId,
  onTableChange,
  onDeleteTable,
}) {
  const { cloudId } = useParams();
  const [contextMenuTableId, setContextMenuTableId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createTableDialogOpen, setCreateTableDialogOpen] = useState(false);

  const tables = useSelector((state) => selectTablesByCloudId(state, cloudId));

  const validTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    return tables.filter((table) => table && table.id);
  }, [tables]);

  const numericActiveId = typeof activeTableId === 'string' ? parseInt(activeTableId, 10) : activeTableId;

  if (validTables.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground border-b border-border">
        No tables available
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 flex items-center border-b border-border bg-muted/30 box-border overflow-hidden">
      {/* Add Table Button */}
      <div className="flex items-center px-2 py-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCreateTableDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Table Tabs - Google Sheets style */}
      <div className="flex-1 min-w-0 flex items-end overflow-x-auto">
        {validTables.map((table) => {
          const isActive = table.id === numericActiveId;
          return (
            <div key={table.id} className="flex items-center shrink-0">
              <button
                onClick={() => onTableChange(table.id)}
                className={cn(
                  'group relative px-4 py-1.5 text-sm font-medium transition-all duration-200',
                  'border-t-2 rounded-t-lg whitespace-nowrap',
                  'flex items-center gap-2',
                  isActive
                    ? 'bg-background text-foreground border-t-primary shadow-sm z-10'
                    : 'bg-transparent text-muted-foreground border-t-transparent hover:bg-accent/50 hover:text-foreground',
                )}
              >
                <span className="truncate max-w-[150px]">{table.name || 'Untitled'}</span>
                {isActive && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="h-5 w-5 rounded hover:bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuTableId(table.id);
                        }}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setContextMenuTableId(table.id);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setContextMenuTableId(table.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this table? All data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (contextMenuTableId) {
                  onDeleteTable(contextMenuTableId);
                  setDeleteDialogOpen(false);
                  setContextMenuTableId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Table Drawer */}
      <EditTableDrawer
        baseId={cloudId}
        tableId={contextMenuTableId}
        table={validTables.find((t) => t.id === contextMenuTableId)}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setContextMenuTableId(null);
        }}
      />

      {/* Create Table Dialog */}
      <CreateTableDialog
        baseId={cloudId}
        open={createTableDialogOpen}
        onClose={() => setCreateTableDialogOpen(false)}
      />
    </div>
  );
}

export default memo(CloudTableTabs);
