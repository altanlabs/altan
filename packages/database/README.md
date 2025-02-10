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
  API_BASE_URL: "https://api.example.com",
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
function TodoList() {
  const { 
    records,          // Array of records from the table
    isLoading,        // Loading state
    error,           // Error state
    addRecord,       // Create new record
    modifyRecord,    // Update record
    removeRecord,    // Delete record
    refresh         // Refresh data with new query
  } = useDatabase("todos", {
    // Optional initial query
    filters: [
      { field: "completed", operator: "eq", value: false }
    ],
    sort: [{ field: "created_time", direction: "desc" }],
    limit: 20
  });

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
```

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
  
  // Methods
  refresh: (options?: FetchOptions) => Promise<void>
  fetchNextPage: () => Promise<void>
  addRecord: (record: Record<string, unknown>) => Promise<void>
  modifyRecord: (id: string, updates: Record<string, unknown>) => Promise<void>
  removeRecord: (id: string) => Promise<void>
  addRecords: (records: Record<string, unknown>[]) => Promise<void>
  removeRecords: (ids: string[]) => Promise<void>
}
```

## License

MIT
