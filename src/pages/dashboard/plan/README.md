# Plans Module - Refactored

## Overview

This module has been completely refactored to follow **DRY** and **SOLID** principles with strict **grayscale minimalism** design following Vercel/OpenAI aesthetic standards.

## Architecture

### Directory Structure

```
plan/
├── components/          # Reusable UI components
│   ├── plan-card.tsx
│   ├── plan-empty-state.tsx
│   ├── plan-error-state.tsx
│   ├── plan-header.tsx
│   ├── plan-loading-state.tsx
│   ├── plan-progress-bar.tsx
│   ├── plan-roadmap.tsx
│   ├── plan-status-badge.tsx
│   ├── plans-grid.tsx
│   ├── task-list-item.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── use-plan-approval.ts
│   └── use-plan-data.ts
├── utils/              # Pure utility functions
│   ├── plan-calculations.ts
│   └── plan-status.ts
├── Plan.tsx           # Single plan view
├── PlansList.tsx      # Plans list view
└── index.ts           # Module exports
```

## Design Principles Applied

### DRY (Don't Repeat Yourself)

1. **Extracted Shared Components:**
   - `PlanLoadingState` - Reusable loading indicator
   - `PlanErrorState` - Consistent error display
   - `PlanEmptyState` - Empty state messaging
   - `PlanStatusBadge` - Status display logic
   - `PlanProgressBar` - Progress visualization
   - `PlanCard` - Plan card UI

2. **Centralized Logic:**
   - `plan-status.ts` - Status colors, icons, and priorities
   - `plan-calculations.ts` - Progress, sorting, date formatting
   - `use-plan-data.ts` - Data fetching logic
   - `use-plan-approval.ts` - Approval workflow

3. **Type Definitions:**
   - `/types/plan.ts` - Shared TypeScript types

### SOLID Principles

1. **Single Responsibility:**
   - Each component has one clear purpose
   - Utility functions are pure and focused
   - Hooks encapsulate specific business logic

2. **Open/Closed:**
   - Components accept props for configuration
   - Status colors/icons easily extensible
   - New plan states can be added without modifying core logic

3. **Dependency Inversion:**
   - Components depend on interfaces (props), not implementations
   - Hooks abstract Redux/API logic from UI
   - Pure functions for calculations

## Design System

### Colors (Grayscale Only)

- Background: `bg-white dark:bg-neutral-950`
- Text: `text-neutral-900 dark:text-neutral-100`
- Borders: `border-neutral-200 dark:border-neutral-800`
- Hover: `hover:bg-neutral-100 dark:hover:bg-neutral-800`
- Muted: `text-neutral-600 dark:text-neutral-400`

### Typography

- Small text: `text-xs` (12px)
- Regular text: `text-sm` (14px)
- Headers: `text-base` (16px) - rarely used
- Monospace for IDs/counts: `font-mono`

### Spacing

- Compact: `px-3 py-2` for buttons/cards
- Gaps: `gap-2` or `gap-3`
- Margins: `mb-3` or `mb-4`

### Components

- Height: `h-8` for buttons
- Border radius: `rounded-md` (small)
- Shadows: `shadow-sm` (minimal)
- Icons: `w-4 h-4` (16px)

### Interactions

- Transitions: `transition-colors` only
- Focus rings: `ring-2 ring-neutral-900 dark:ring-neutral-100`
- No animations except loading spinners

## Components

### PlansList

**Purpose:** Display all plans for a project

**Features:**
- Responsive grid layout (1 col mobile, 2 cols desktop)
- Loading, error, and empty states
- Optimistic progress calculation
- Click to navigate to individual plan

**Props:**
- `roomId: string` - Project/room identifier

### Plan

**Purpose:** Display single plan with tasks

**Features:**
- Plan approval workflow
- Auto-redirect on completion (websocket)
- Task expansion/collapse
- Subthread navigation
- Progress tracking

**Props:**
- `planId: string` - Plan identifier
- `altanerId: string` - Project identifier

### Shared Components

#### PlanStatusBadge
Displays plan status with appropriate grayscale styling.

#### PlanProgressBar
Visual progress indicator with optional task count label.

#### TaskListItem
Individual task row with expand/collapse, status icon, and subthread link.

## Hooks

### usePlansData

Fetches and enriches plans data for a room.

```typescript
const { plans, isLoading, error } = usePlansData(roomId);
```

### usePlanApproval

Handles plan approval workflow.

```typescript
const { isApproving, error, approvePlan } = usePlanApproval(plan);
```

## Utilities

### plan-status.ts

- `STATUS_PRIORITY` - Task sorting order
- `getPlanStatusColor()` - Status badge colors
- `getTaskStatusIcon()` - Status icons (lucide-react)
- `getTaskStatusColor()` - Task text colors
- `isTaskCompleted()` - Completion check

### plan-calculations.ts

- `calculateProgress()` - Task completion stats
- `sortTasksByPriority()` - Task ordering
- `calculateEstimatedTime()` - Time estimation
- `formatDate()` - Date formatting
- `enrichPlanWithProgress()` - Add progress to plan

## Key Improvements

1. **TypeScript:** Full type safety with explicit interfaces
2. **Performance:** React.memo on all components, useMemo for calculations
3. **Maintainability:** Clear separation of concerns
4. **Scalability:** Easy to add new features/states
5. **Accessibility:** Semantic HTML, proper button elements
6. **Design:** Strict grayscale minimalism, perfect light/dark mode
7. **Bundle Size:** Lucide-react (tree-shakeable) instead of Iconify where possible
8. **Code Quality:** No MUI dependencies, consistent patterns

## Migration

Old files (`Plan.jsx`, `PlansList.jsx`) now re-export from TypeScript versions for backward compatibility:

```javascript
// PlansList.jsx
export { default } from './plan/PlansList';
```

This allows gradual migration without breaking existing imports.

## Future Enhancements

- Add plan creation UI
- Implement plan editing
- Add keyboard shortcuts
- Implement drag-and-drop task reordering
- Add task filtering/search
- Export plan as PDF/Markdown

