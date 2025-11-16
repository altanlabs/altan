# Migration Guide: Cloud Slice Refactoring

## 🎉 No Breaking Changes!

The refactoring maintains **100% backwards compatibility**. All existing code will continue to work without any changes.

## 📋 What Changed

### File Structure

**Before:**
```
redux/slices/
└── cloud.ts (847 lines)
```

**After:**
```
redux/slices/
├── cloud.ts (backwards compatibility layer)
└── cloud/
    ├── slices/       (6 files)
    ├── thunks/       (6 files)
    ├── selectors/    (6 files)
    ├── utils/        (4 files)
    ├── types.ts
    ├── combineReducers.ts
    ├── index.ts
    └── README.md
```

## 🔄 Import Patterns

### All existing imports still work:

```typescript
// ✅ Still works - imports from compatibility layer
import { 
  fetchCloud, 
  selectCloudById, 
  setCloud 
} from '@/redux/slices/cloud';
```

### Optional: Use new modular imports

```typescript
// ✨ New way - more explicit
import { fetchCloud } from '@/redux/slices/cloud/thunks';
import { selectCloudById } from '@/redux/slices/cloud/selectors';
import { setCloud } from '@/redux/slices/cloud/slices';

// or use the main index (recommended)
import { 
  fetchCloud, 
  selectCloudById, 
  setCloud 
} from '@/redux/slices/cloud';
```

## 🚀 Recommended Migration Path (Optional)

While not required, you can gradually adopt the new patterns:

### Phase 1: Continue as normal
- Keep all existing imports
- No changes needed
- Everything works as before

### Phase 2: Update new code (optional)
When writing new features, consider using explicit imports:

```typescript
// More explicit about what you're importing
import { fetchRecords } from '@/redux/slices/cloud/thunks/tables.thunks';
import { selectTableRecords } from '@/redux/slices/cloud/selectors/tables.selectors';
```

### Phase 3: Refactor gradually (optional)
When touching old code, optionally update imports to be more explicit.

## 🎯 Key Improvements You Can Use

### 1. Use Shared Utilities

Instead of duplicating logic:

```typescript
// ❌ Before: Duplicated in multiple places
const normalizedId = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;

// ✅ After: Use shared utility
import { normalizeTableId } from '@/redux/slices/cloud/utils';
const normalizedId = normalizeTableId(tableId);
```

### 2. Use Cache Helpers

```typescript
// ❌ Before: Manual cache check
const isFresh = existingData && 
  lastFetched && 
  Date.now() - lastFetched < 60 * 60 * 1000;

// ✅ After: Use helper
import { isCacheFresh, CACHE_DURATION } from '@/redux/slices/cloud/utils';
const isFresh = isCacheFresh(lastFetched, CACHE_DURATION.ONE_HOUR);
```

### 3. Use Type Exports

```typescript
// ✅ All types available from main export
import type { 
  CloudInstance, 
  TableState, 
  SearchResult 
} from '@/redux/slices/cloud';
```

## 🧪 Testing Improvements

Each domain can now be tested independently:

```typescript
// Test individual slice
import cloudsReducer, { setCloud } from '@/redux/slices/cloud/slices/clouds.slice';

describe('Clouds Slice', () => {
  it('should set cloud', () => {
    const state = cloudsReducer(undefined, setCloud(mockCloud));
    expect(state.clouds[mockCloud.id]).toEqual(mockCloud);
  });
});

// Test individual thunk
import { fetchCloud } from '@/redux/slices/cloud/thunks/clouds.thunks';

describe('fetchCloud thunk', () => {
  it('should fetch cloud data', async () => {
    // Test in isolation
  });
});

// Test individual selector
import { selectCloudById } from '@/redux/slices/cloud/selectors/clouds.selectors';

describe('selectCloudById', () => {
  it('should select cloud by id', () => {
    const result = selectCloudById(mockState, 'cloud-1');
    expect(result).toEqual(mockState.cloud.clouds['cloud-1']);
  });
});
```

## 📦 Store Configuration

No changes needed! The combined reducer maintains the same state shape:

```typescript
// store.ts - No changes needed
import cloudReducer from './slices/cloud';

const store = configureStore({
  reducer: {
    cloud: cloudReducer,
    // ... other reducers
  },
});
```

## 🎨 State Shape (Unchanged)

The state structure remains the same:

```typescript
{
  cloud: {
    clouds: { /* CloudsState */ },
    tables: { /* TablesState */ },
    users: { /* UsersState */ },
    buckets: { /* BucketsState */ },
    navigation: { /* NavigationState */ }
  }
}
```

## ⚠️ Important Notes

1. **No Action Needed**: Your existing code works without changes
2. **Gradual Adoption**: Adopt new patterns at your own pace
3. **Same Behavior**: All functionality works exactly as before
4. **Better Organization**: Easier to find and maintain code
5. **Extensible**: Easy to add new features

## 🆘 Troubleshooting

### Issue: "Cannot find module './cloud'"
**Solution**: Make sure you're importing from `@/redux/slices/cloud` not `@/redux/slices/cloud.ts`

### Issue: Type errors after refactoring
**Solution**: All types are re-exported. Import from main index:
```typescript
import type { CloudInstance } from '@/redux/slices/cloud';
```

### Issue: Action not found
**Solution**: All actions are re-exported from the compatibility layer. Check spelling and import path.

## 💡 Best Practices Going Forward

1. **Import from main index**: `from '@/redux/slices/cloud'`
2. **Use utilities**: Don't duplicate helper functions
3. **Keep slices focused**: Each handles one domain
4. **Use selectors**: Access state through memoized selectors
5. **Type everything**: Leverage TypeScript types

## 📚 Additional Resources

- [README.md](./README.md) - Architecture overview
- [types.ts](./types.ts) - Type definitions
- [utils/](./utils/) - Shared utilities

## 🎓 Learning from This Refactoring

This refactoring demonstrates:
- **Single Responsibility Principle** in Redux
- **DRY principle** with shared utilities
- **Backwards compatibility** strategies
- **Incremental refactoring** techniques
- **Clean code** organization

Consider applying these patterns to other large files in your codebase (e.g., `bases.ts`).

---

**Questions?** Check the [README.md](./README.md) or review the code structure.

