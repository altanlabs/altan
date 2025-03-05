# @altanlabs/database

A React library for database integration with simple hooks and Redux state management.

## Installation

```bash
npm install @altanlabs/database
```

## Quick Start

### 1. Set up the Provider

```tsx
import { DatabaseProvider } from "@altanlabs/database";

const config = {
  API_BASE_URL: "https://api.altan.ai/galaxia/hook/a9lcf",
  SAMPLE_TABLES: {
    todos: "550e8400-e29b-41d4-a716-446655440000" // Must be UUID
  }
};

function App() {
  return (
    <DatabaseProvider config={config}>
      <YourApp />
    </DatabaseProvider>
  );
}
```

### 2. Use the Hook

```tsx
// Basic usage
function TodoList() {
  const { records, isLoading, error } = useDatabase("todos");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Add Todo */}
      <button onClick={() => addRecord({ 
        text: "New Todo",
        completed: false 
      })}>
        Add Todo
      </button>

      {/* List Todos */}
      {records.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => modifyRecord(todo.id, { 
            completed: !todo.completed 
          })}>
            Toggle
          </button>
          <button onClick={() => removeRecord(todo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// Advanced usage with initial query
function CompletedTodoList() {
  const { records, isLoading, error } = useDatabase("todos", {
    // Filter for completed todos
    filters: [
      { field: "completed", operator: "eq", value: true }
    ],
    // Sort by creation date
    sort: [
      { field: "created_at", direction: "desc" }
    ],
    // Limit to 10 records per page
    limit: 10,
    // Select specific fields
    fields: ["id", "text", "completed", "created_at"],
    // Get all records (alternative: "first" or "one")
    amount: "all"
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {records.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <span>Created: {todo.created_at}</span>
        </div>
      ))}
    </div>
  );
}

// Using multiple filters and complex queries
function FilteredProjectList() {
  const { records } = useDatabase("projects", {
    filters: [
      { field: "status", operator: "in", value: ["active", "pending"] },
      { field: "priority", operator: "gte", value: 2 },
      { field: "due_date", operator: "lte", value: new Date().toISOString() }
    ],
    sort: [
      { field: "priority", direction: "desc" },
      { field: "due_date", direction: "asc" }
    ],
    limit: 20,
    fields: ["id", "title", "status", "priority", "due_date"]
  });

  // ... rest of the component
}
```

## Important Notes

### State Management

- The library automatically manages the Redux state. When you perform operations like `addRecord`, `modifyRecord`, or `removeRecord`, the Redux store is automatically updated without requiring a manual refresh.
- Only use `refresh()` when you explicitly need to re-fetch data from the server (e.g., when you want to sync with other users' changes).

### Record IDs and Relationships

When working with records and relationships:

- Record IDs are integers
- Single relationships should be named with `_id` suffix:
  ```typescript
  addRecord({ 
    title: "Task",
    user_id: 3  // Single relationship
  })
  ```
- Multiple relationships should use the plural table name:
  ```typescript
  addRecord({
    title: "Project",
    users: [1, 2, 3]  // Multiple relationships
  })
  ```

### Attachments

For fields of type `attachment`, you can directly upload multiple media files. The field accepts an array of media objects:

```typescript
// Upload new files
await addRecord({
  title: "Document",
  attachments: [{
    file_name: "document.pdf",
    mime_type: "application/pdf",
    file_content: "base64_encoded_content..."
  }]
});

// Update attachments - keep existing and add new
await modifyRecord(recordId, {
  attachments: [
    { id: "existing_media_1", ... },  // Keep existing media
    { id: "existing_media_2", ... },  // Keep existing media
    {                           // Add new media
      file_name: "new.pdf",
      mime_type: "application/pdf",
      file_content: "base64_encoded_content..."
    }
  ]
});

// Remove all attachments
await modifyRecord(recordId, {
  attachments: []  // Empty array removes all media
});
```

**Behavior:**
- Media objects with an `id` field are treated as references to existing media
- Media objects without an `id` field are treated as new media to be created
- Any existing media not included in the update will be deleted
- Sending an empty array (`[]`) or `null` will remove all media

**Error Handling:**
The API will return a 400 Bad Request if:
- The media object format is invalid
- Required fields are missing
- The file content is not properly base64 encoded
- Referenced media IDs don't exist

## Features

### Query Options

```tsx
// Refresh with new query
refresh({
  // Filter records
  filters: [
    { field: "status", operator: "eq", value: "active" }
  ],
  
  // Sort records
  sort: [
    { field: "created_time", direction: "desc" }
  ],
  
  // Pagination
  limit: 20,
  pageToken: "next_page_token",
  
  // Select specific fields
  fields: ["id", "text", "completed"],
  
  // Amount of records
  amount: "all" // "all" | "first" | "one"
});
```

### Pagination

```tsx
function PaginatedList() {
  const { records, nextPageToken, fetchNextPage } = useDatabase("todos");

  return (
    <div>
      {records.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      
      {nextPageToken && (
        <button onClick={fetchNextPage}>Load More</button>
      )}
    </div>
  );
}
```

### Bulk Operations

```tsx
const { addRecords, removeRecords } = useDatabase("todos");

// Create multiple records
await addRecords([
  { text: "Todo 1", completed: false },
  { text: "Todo 2", completed: false }
]);

// Delete multiple records
await removeRecords(["id1", "id2", "id3"]);
```

### Error Handling

```tsx
const { addRecord } = useDatabase("todos");

try {
  await addRecord(
    { text: "New Todo" },
    (error) => console.error("Failed to add todo:", error)
  );
} catch (error) {
  console.error("Unexpected error:", error);
}
```

## API Reference

### useDatabase Hook Returns

```typescript
{
  // Data
  records: TableRecordItem[]      // Table records
  schema: TableSchema | null      // Table schema
  
  // State
  isLoading: boolean             // Records loading state
  schemaLoading: boolean         // Schema loading state
  error: string | null           // Error message if any
  nextPageToken: string | null   // Pagination token
  lastUpdated: string | null     // Last update timestamp
  
  // Methods - All methods accept an optional onError callback
  refresh: (options?: FetchOptions) => Promise<void>
  fetchNextPage: () => Promise<void>
  
  // Record manipulation methods with return values
  addRecord: (record: Record<string, unknown>) => Promise<TableRecordItem | undefined>
  // Returns the newly created record or undefined if failed
  
  modifyRecord: (id: string, updates: Record<string, unknown>) => Promise<TableRecordItem | undefined>
  // Returns the updated record or undefined if failed
  
  removeRecord: (id: string) => Promise<{ tableId: string; recordId: string } | undefined>
  // Returns deletion confirmation or undefined if failed
  
  addRecords: (records: Record<string, unknown>[]) => Promise<TableRecordItem[] | undefined>
  // Returns array of newly created records or undefined if failed
  
  removeRecords: (ids: string[]) => Promise<{ tableId: string; recordIds: string[] } | undefined>
  // Returns deletion confirmation or undefined if failed
}
```

### Working with Record Manipulation Returns

```typescript
// Creating a record and using the return value
const newTodo = await addRecord({ 
  text: "New Todo",
  completed: false 
});
if (newTodo) {
  console.log('Created todo with ID:', newTodo.id);
}

// Creating multiple records
const newRecords = await addRecords([
  { text: "Todo 1", completed: false },
  { text: "Todo 2", completed: false }
]);
if (newRecords) {
  console.log('Created todos with IDs:', newRecords.map(r => r.id));
}

// Updating a record
const updatedTodo = await modifyRecord(todoId, { 
  completed: true 
});
if (updatedTodo) {
  console.log('Todo updated:', updatedTodo);
}

// Deleting records with confirmation
const deleteResult = await removeRecords([id1, id2]);
if (deleteResult) {
  console.log('Successfully deleted records:', deleteResult.recordIds);
}
```

## License

MIT

## ⚠️ Important Performance Considerations

### Avoiding Infinite Query Loops

The `useDatabase` hook can potentially trigger infinite query loops if not used carefully. Here are some common pitfalls and how to avoid them:

❌ **DON'T: Create multiple database hooks for the same data**
```tsx
// BAD: Each PlayerCard makes its own connection query
function PlayerCard({ userId, playerId }) {
  const { records } = useDatabase("connections", {
    filters: [
      { field: "user_id", operator: "eq", value: userId },
      { field: "player_id", operator: "eq", value: playerId }
    ]
  });
  // This creates N queries for N cards!
}
```

✅ **DO: Lift database queries to the parent component**
```tsx
// GOOD: Parent component manages all connections
function PlayerList() {
  const { records: connections } = useDatabase("connections", {
    filters: [
      { field: "user_id", operator: "eq", value: userId }
    ],
    enabled: !!userId  // Prevent queries when userId is not available
  });

  return players.map(player => (
    <PlayerCard 
      key={player.id}
      player={player}
      isConnected={connections.some(c => c.player_id === player.id)}
      onConnect={handleConnect}
    />
  ));
}
```

### Best Practices

1. **Single Source of Truth**: 
   - Keep database queries at the highest necessary level in your component tree
   - Pass down data and handlers to child components as props
   - Avoid querying the same table in multiple components

2. **Control Query Execution**:
   ```tsx
   // Use the enabled option to prevent unnecessary queries
   const { records } = useDatabase("table", {
     filters: [...],
     enabled: !!dependentData  // Query only runs when dependentData exists
   });
   ```

3. **Batch Operations**:
   - Use `addRecords` instead of multiple `addRecord` calls
   - Use `removeRecords` for bulk deletions
   ```tsx
   // GOOD: Single batch operation
   await addRecords(newItems);
   
   // BAD: Multiple individual operations
   for (const item of newItems) {
     await addRecord(item);  // Don't do this!
   }
   ```

4. **Optimize Queries**:
   - Only request fields you need using the `fields` option
   - Use appropriate `limit` values
   - Consider pagination for large datasets

### Common Anti-Patterns to Avoid

1. **Nested Database Hooks**:
   ```tsx
   // BAD: Nested queries can cause exponential number of requests
   function ParentComponent() {
     const { records: users } = useDatabase("users");
     return users.map(user => <ChildWithDatabase userId={user.id} />);
   }
   ```

2. **Unnecessary Refreshes**:
   ```tsx
   // BAD: Don't refresh on every render or in short intervals
   useEffect(() => {
     refresh();  // This will cause continuous refreshes!
   });
   ```

3. **Missing Error Handling**:
   ```tsx
   // BAD: No error handling
   const handleClick = () => {
     addRecord(data);  // Errors are silently ignored
   };

   // GOOD: Proper error handling
   const handleClick = async () => {
     try {
       await addRecord(data, (error) => {
         console.error('Failed to add record:', error);
         notifyUser(error.message);
       });
     } catch (error) {
       handleError(error);
     }
   };
   ```
