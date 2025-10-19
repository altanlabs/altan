import { Database, Users, FolderOpen, Code } from 'lucide-react';

export const PRODUCTS = [
  {
    id: 'database',
    name: 'Database',
    description: 'PostgreSQL database',
    icon: Database,
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management',
    icon: Users,
  },
  {
    id: 'services',
    name: 'Services',
    description: 'API services and integrations',
    icon: Code,
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'File storage',
    icon: FolderOpen,
  },
];
