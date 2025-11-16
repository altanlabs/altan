# Cloud Slice - Refactored Architecture

This directory contains the refactored cloud slice, organized following **SOLID** and **DRY** principles.

## 📁 Directory Structure

```
cloud/
├── slices/              # Domain-specific reducers (Single Responsibility)
│   ├── clouds.slice.ts      # Cloud instance management
│   ├── tables.slice.ts      # Table records & pagination
│   ├── users.slice.ts       # User cache management
│   ├── buckets.slice.ts     # Bucket cache management
│   ├── navigation.slice.ts  # UI navigation state
│   └── index.ts            # Slice exports
├── thunks/              # Async operations by domain
│   ├── clouds.thunks.ts    # Cloud CRUD operations
│   ├── tables.thunks.ts    # Record CRUD operations
│   ├── users.thunks.ts     # User operations
│   ├── buckets.thunks.ts   # Bucket operations
│   ├── search.thunks.ts    # Search operations
│   └── index.ts           # Thunk exports
├── selectors/           # Memoized selectors by domain
│   ├── clouds.selectors.ts
│   ├── tables.selectors.ts
│   ├── users.selectors.ts
│   ├── buckets.selectors.ts
│   ├── navigation.selectors.ts
│   └── index.ts
├── utils/               # Shared utilities (DRY)
│   ├── asyncHelpers.ts     # Error handling utilities
│   ├── cacheHelpers.ts     # Cache management utilities
│   ├── tableHelpers.ts     # Table operation utilities
│   └── index.ts
├── types.ts             # TypeScript type definitions
├── combineReducers.ts   # Combines sub-reducers
├── index.ts            # Main entry point
└── README.md           # This file
```

## 🎯 Design Principles Applied

### 1. **Single Responsibility Principle (SRP)**
Each slice handles only one domain:
- `clouds.slice.ts` → Cloud instances only
- `tables.slice.ts` → Table records only
- `users.slice.ts` → User cache only
- `buckets.slice.ts` → Bucket cache only
- `navigation.slice.ts` → UI state only

**Before:** 847 lines in one file handling 5+ domains  
**After:** 5 focused files, ~50-150 lines each

### 2. **Don't Repeat Yourself (DRY)**
Common patterns extracted to utilities:
- **Error handling:** `handleThunkError()`, `withErrorHandling()`
- **Cache management:** `isCacheFresh()`, `shouldUseCache()`
- **Table operations:** `normalizeTableId()`, `findTableById()`

### 3. **Open/Closed Principle**
Easy to extend without modifying existing code:
- Add new domain → Create new slice file
- Add new operation → Add new thunk file
- Add new selector → Add new selector file

### 4. **Separation of Concerns**
- **State shape** → `types.ts`
- **State updates** → `slices/`
- **Async logic** → `thunks/`
- **Data access** → `selectors/`
- **Utilities** → `utils/`

## 📖 Usage Examples

### Importing Actions

```typescript
// Individual imports
import { setCloud, updateCloud } from '@/redux/slices/cloud';

// Namespaced imports (recommended for clarity)
import { actions } from '@/redux/slices/cloud';
actions.clouds.setCloud(cloudInstance);
```

### Importing Thunks

```typescript
import { fetchCloud, fetchRecords } from '@/redux/slices/cloud';

// Usage in component
dispatch(fetchCloud('cloud-id'));
dispatch(fetchRecords('cloud-id', 'table-id', { limit: 50 }));
```

### Importing Selectors

```typescript
import { 
  selectCloudById,
  selectTableRecords,
  selectUsersForCloud 
} from '@/redux/slices/cloud';

// Usage in component
const cloud = useSelector((state) => selectCloudById(state, cloudId));
const records = useSelector((state) => selectTableRecords(state, tableId));
const users = useSelector((state) => selectUsersForCloud(state, cloudId));
```

### Using Utilities

```typescript
import { normalizeTableId, isTextSearchableField } from '@/redux/slices/cloud';

const numericId = normalizeTableId(tableId); // string | number → number
const isSearchable = isTextSearchableField(field); // Check if field is searchable
```

## 🔄 Backwards Compatibility

The original `cloud.ts` file has been converted to a compatibility layer that re-exports everything from the new structure. **All existing code continues to work without changes.**

```typescript
// Old import (still works)
import { fetchCloud, selectCloudById } from '@/redux/slices/cloud';

// New import (same result)
import { fetchCloud } from '@/redux/slices/cloud/thunks';
import { selectCloudById } from '@/redux/slices/cloud/selectors';
```

## 📊 Benefits

### Before Refactoring
- ❌ 847 lines in single file
- ❌ Multiple responsibilities mixed together
- ❌ Difficult to find specific functionality
- ❌ Code duplication across thunks
- ❌ Hard to test in isolation
- ❌ Slow to load in editor

### After Refactoring
- ✅ Files under 200 lines each
- ✅ Clear separation of concerns
- ✅ Easy to locate functionality
- ✅ Shared utilities eliminate duplication
- ✅ Each unit testable independently
- ✅ Fast editor performance

## 🧪 Testing

Each domain can now be tested independently:

```typescript
// Test clouds slice
import cloudsReducer, { setCloud } from './slices/clouds.slice';

// Test tables thunk
import { fetchRecords } from './thunks/tables.thunks';

// Test selector
import { selectCloudById } from './selectors/clouds.selectors';
```

## 🚀 Adding New Features

### Adding a New Domain (e.g., "files")

1. Create slice: `slices/files.slice.ts`
2. Create thunks: `thunks/files.thunks.ts`
3. Create selectors: `selectors/files.selectors.ts`
4. Add to `combineReducers.ts`
5. Export from `index.ts`

No need to modify existing files!

## 📚 Related Documentation

- Original file: `../cloud.ts` (now a compatibility layer)
- Store setup: `../../store.ts`
- Similar refactoring: `../bases/` (to be refactored)

## 🎓 Best Practices

1. **Keep slices pure** - Only synchronous state updates
2. **Keep thunks focused** - One async operation per thunk
3. **Use selectors** - Always access state through selectors
4. **Use utilities** - Don't duplicate helper logic
5. **Type everything** - Leverage TypeScript for safety
6. **Document complex logic** - Add comments for non-obvious code

## 🔗 Next Steps

Consider applying this same refactoring pattern to:
- `bases.ts` (1757 lines) → Can be split into similar structure
- Other large slices in the codebase

---

**Refactored:** 2025  
**Pattern:** Domain-driven Redux architecture  
**Principles:** SOLID, DRY, Clean Code

