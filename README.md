# @altanlabs – Combined Documentation

## 1. Installation

Install both libraries:
```bash
npm install @altanlabs/database @altanlabs/auth
```

## 2. Setup

### 2.1 Provider Setup

Wrap your app with both providers:

```jsx
import "@altanlabs/auth/dist/styles.css";  // Important: Import auth styles
import { AuthProvider } from "@altanlabs/auth";
import { DatabaseProvider } from "@altanlabs/database";

const databaseConfig = {
  API_BASE_URL: "https://api.altan.ai/galaxia/hook/a9lcf",
  SAMPLE_TABLES: {
    todos: "550e8400-e29b-41d4-a716-446655440000"
  }
};

function Root() {
  return (
    <AuthProvider tableId="your-users-table-id">
      <DatabaseProvider config={databaseConfig}>
        <App />
      </DatabaseProvider>
    </AuthProvider>
  );
}
```

## 3. Database Features

### 3.1 Basic Hook Usage

```jsx
function TodoList() {
  const { records, isLoading, error, addRecord, modifyRecord, removeRecord } = useDatabase("todos");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={() => addRecord({ text: "New Todo", completed: false })}>
        Add Todo
      </button>
      {records.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => modifyRecord(todo.id, { completed: !todo.completed })}>
            Toggle
          </button>
          <button onClick={() => removeRecord(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 3.2 Advanced Query Usage

```jsx
function CompletedTodoList() {
  const { records } = useDatabase("todos", {
    filters: [
      { field: "completed", operator: "eq", value: true }
    ],
    sort: [
      { field: "created_at", direction: "desc" }
    ],
    limit: 10,
    fields: ["id", "text", "completed", "created_at"],
    amount: "all"
  });

  return (
    <div>
      {records.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <span>{todo.created_at}</span>
        </div>
      ))}
    </div>
  );
}
```

### 3.3 Bulk Operations

```jsx
const { addRecords, removeRecords } = useDatabase("todos");

// Create multiple records
await addRecords([
  { text: "Todo 1", completed: false },
  { text: "Todo 2", completed: false }
]);

// Delete multiple records
await removeRecords([1, 2, 3]);  // Note: IDs are numbers
```

### 3.4 Attachments

```jsx
// Upload new attachments
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
    { id: "existing_media_1" },  // Keep existing
    {                           // Add new
      file_name: "new.pdf",
      mime_type: "application/pdf",
      file_content: "base64_encoded_content..."
    }
  ]
});

// Remove all attachments
await modifyRecord(recordId, { attachments: [] });
```

### 3.5 Pagination

```jsx
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

## 4. Authentication Features

### 4.1 Sign In Component

```jsx
import { SignIn } from "@altanlabs/auth";

function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a'  // Dark background
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#2d2d2d',  // Darker card background
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'  // More pronounced shadow for dark theme
      }}>
        <SignIn
          appearance={{ theme: "dark" }}
          companyName="Your Company"
          signUpUrl="/sign-up"
          withSignUp
          routing="path"
        />
      </div>
    </div>
  );
}
```

### 4.2 Sign Up Component

```jsx
import { SignUp } from "@altanlabs/auth";

function SignUpPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a'  // Dark background
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#2d2d2d',  // Darker card background
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'  // More pronounced shadow for dark theme
      }}>
        <SignUp
          appearance={{ theme: "dark" }}
          companyName="Your Company"
          signInUrl="/sign-in"
          withSignIn
          routing="path"
        />
      </div>
    </div>
  );
}
```

### 4.3 User Profile

```jsx
import { UserProfile } from "@altanlabs/auth";

function ProfilePage() {
  return (
    <UserProfile
      appearance={{ theme: "dark" }}
      showCustomFields
      editableFields={["name", "surname", "email"]}
      hiddenFields={["password"]}
      fallback={<div>Please log in</div>}
    />
  );
}
```

### 4.4 Authentication Hook

```jsx
import { useAuth } from "@altanlabs/auth";

function ProfileButton() {
  const { user, logout } = useAuth();

  if (!user) {
    return <button onClick={() => (window.location.href = "/login")}>Sign In</button>;
  }

  return (
    <div>
      <span>Welcome, {user.name}!</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 5. Best Practices

### 5.1 Database Best Practices

1. **Lift Queries Up**
   - Keep database queries at the highest necessary level
   - Pass data down to child components as props
   - Avoid querying the same table in multiple components

2. **Optimize Performance**
   ```jsx
   const { records } = useDatabase("table", {
     filters: [...],
     enabled: !!dependentData,  // Only query when needed
     fields: ["id", "name"],    // Only request needed fields
     limit: 20                  // Use pagination
   });
   ```

3. **Use Batch Operations**
   ```jsx
   const { addRecords } = useDatabase("todos");

   // ✅ GOOD: Use batch operations
   await addRecords([
     { text: "Task 1", completed: false },
     { text: "Task 2", completed: false },
     { text: "Task 3", completed: false }
   ]);

   // ❌ BAD: Don't loop through items
   // for (const item of newItems) {
   //   await addRecord(item);  // This creates multiple API calls!
   // }
   ```

### 5.2 Auth Best Practices

1. **Protected Routes**
   ```jsx
   function PrivateRoute({ children }) {
     const { user, isLoading } = useAuth();
     
     if (isLoading) return <div>Loading...</div>;
     if (!user) return <Navigate to="/login" />;
     
     return children;
   }
   ```

2. **Error Handling**
   ```jsx
   try {
     await addRecord(data, (error) => {
       console.error('Failed:', error);
       notifyUser(error.message);
     });
   } catch (error) {
     handleError(error);
   }
   ```

## 6. Important Notes

1. **Record IDs**
   - All record IDs are numbers (not strings)
   - Use negative IDs for temporary records in optimistic updates
   - Server will assign permanent positive IDs

2. **Authentication State**
   - Auth state is automatically persisted
   - Use `useAuth` hook to access current user
   - Always handle loading states

3. **Styling**
   - Don't forget to import auth styles: `import "@altanlabs/auth/dist/styles.css"`
   - Auth components accept theme customization via `appearance` prop

## 7. Type Information

```typescript
// Database Types
interface TableRecordItem {
  id: number;
  [key: string]: unknown;
  created_time?: string;
  updated_at?: string;
  last_modified_time?: string;
  last_modified_by?: string;
}

interface QueryParams {
  filters?: Array<{
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "contains" | "startsWith";
    value: unknown;
  }>;
  sort?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;
  limit?: number;
  pageToken?: string;
  fields?: string[];
  amount?: "all" | "first" | "one";
}

// Auth Types
interface User {
  id: string;
  name?: string;
  email: string;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}
```