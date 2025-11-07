import {
  Database,
  LayoutGrid,
  Terminal,
  Users,
  Code,
  FolderOpen,
  Radio,
  FileText,
} from 'lucide-react';
import React, { memo } from 'react';

import { cn } from '../../lib/utils';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'tables', label: 'Database', icon: Database },
  { id: 'sql-editor', label: 'SQL Terminal', icon: Terminal },
  { id: 'services', label: 'Services', icon: Code },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'storage', label: 'Storage', icon: FolderOpen },
  // { id: 'realtime', label: 'Realtime', icon: Radio },
  { id: 'logs', label: 'Logs', icon: FileText },
];

function CloudSidebar({ activeSection, onSectionChange, open }) {
  if (!open) return null;

  return (
    <div className="w-56 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
      <nav className="flex flex-col h-full py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default memo(CloudSidebar);
