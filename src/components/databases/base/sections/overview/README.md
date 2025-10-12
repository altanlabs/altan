# BaseOverview Component

A refactored, modular overview component for database instance management. This component displays database metrics, compute configuration, and infrastructure activity.

## Structure

```
overview/
├── BaseOverview.jsx          # Main component orchestrating all subcomponents
├── constants.js              # Product definitions and static data
├── components/               # UI components
│   ├── index.js
│   ├── AlertBanners.jsx          # Database status alerts
│   ├── OverviewHeader.jsx        # Header with refresh controls
│   ├── StatusBadge.jsx           # Active/Paused status indicator
│   ├── ProductShortcuts.jsx      # Grid of product quick links
│   ├── ComputeConfiguration.jsx  # Instance tier selection UI
│   ├── InfrastructureActivity.jsx # CPU, Memory, Storage metrics
│   ├── UsageMetric.jsx           # Reusable metric card component
│   ├── ConfirmationPopover.jsx   # Pause/Resume confirmation
│   └── CloudUpgradeDialog.jsx    # Instance upgrade modal
└── hooks/                    # Custom React hooks
    ├── index.js
    ├── useMetrics.js             # Fetch and manage metrics data
    ├── useInstanceTypes.js       # Fetch available instance types
    ├── useInstanceOperations.js  # Pause/Resume/Upgrade operations
    └── useProductStats.js        # User/Bucket/Table counts

```

## Component Hierarchy

```
BaseOverview
├── AlertBanners
├── OverviewHeader + StatusBadge
├── ProductShortcuts
├── ComputeConfiguration
├── InfrastructureActivity
│   └── UsageMetric (×3)
├── ConfirmationPopover
└── CloudUpgradeDialog
```

## Key Features

- **Modular Design**: Each component has a single responsibility
- **Custom Hooks**: Logic separated from UI for better reusability
- **Type Safety Ready**: Structure prepared for TypeScript migration
- **Clean Imports**: Barrel exports via index files
- **Responsive**: Mobile-first design with Tailwind CSS
- **Animated**: Framer Motion for smooth transitions

## Usage

```jsx
import BaseOverview from './overview/BaseOverview';

<BaseOverview 
  baseId="your-base-id" 
  onNavigate={(section) => console.log(section)} 
/>
```

## Props

### BaseOverview
- `baseId` (string): Database instance identifier
- `onNavigate` (function): Callback for navigation to different sections

## Custom Hooks

### useMetrics(baseId)
Returns metrics data, CPU/memory/storage usage, and refresh function.

### useInstanceTypes()
Returns available instance types and loading state.

### useInstanceOperations(baseId, isPaused)
Returns functions for pause/resume/upgrade operations and their states.

### useProductStats(baseId, base, isPaused)
Returns counts for users, buckets, tables, and a stats formatter function.

## Styling

Uses Tailwind CSS with glassmorphic design principles. All components support dark mode.

## Dependencies

- React
- @mui/material (Dialog, Popover, Snackbar)
- framer-motion
- lucide-react (icons)
- Redux (state management)

