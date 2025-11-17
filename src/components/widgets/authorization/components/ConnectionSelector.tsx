import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import IconRenderer from '../../../icons/IconRenderer';
import type { Connection, ConnectionType } from '../types';

interface ConnectionSelectorProps {
  connections: Connection[];
  connectionType: ConnectionType | undefined;
  selectedConnectionId: string;
  onSelectConnection: (connectionId: string) => void;
  onCreateNew: () => void;
}

const CREATE_NEW_VALUE = 'create_new';

export const ConnectionSelector = memo<ConnectionSelectorProps>(
  ({ connections, connectionType, selectedConnectionId, onSelectConnection, onCreateNew }) => {
    const handleValueChange = (value: string): void => {
      if (value === CREATE_NEW_VALUE) {
        onCreateNew();
      } else {
        onSelectConnection(value);
      }
    };

    // No existing connections - show create button
    if (!connections || connections.length === 0) {
      return (
        <Button
          variant="outline"
          onClick={onCreateNew}
          className="w-full h-8 text-xs"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Connection
        </Button>
      );
    }

    // Show dropdown with connections
    return (
      <Select
        value={selectedConnectionId}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full h-8 text-xs">
          <SelectValue placeholder="Select Connection" />
        </SelectTrigger>
        <SelectContent className="z-[10002]">
          {connections.map((connection) => (
            <SelectItem
              key={connection.id}
              value={connection.id}
              className="text-xs"
            >
              <div className="flex items-center gap-2">
                <IconRenderer icon={connection.connection_type?.icon} />
                <span className="truncate">{connection.name}</span>
              </div>
            </SelectItem>
          ))}
          <SelectItem
            value={CREATE_NEW_VALUE}
            className="text-xs text-neutral-900 dark:text-neutral-100"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create New Connection</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  },
);

ConnectionSelector.displayName = 'ConnectionSelector';

