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
    id: 'storage',
    name: 'Storage',
    description: 'File storage',
    icon: FolderOpen,
  },
  {
    id: 'functions',
    name: 'Functions',
    description: 'Serverless functions',
    icon: Code,
  },
];
