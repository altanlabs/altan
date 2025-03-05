**# @altanlabs – Combined Documentation

## 1. Overview

This documentation merges **@altanlabs/database** and **@altanlabs/auth** into a single reference to help you integrate both libraries seamlessly in your React applications.

---

## 2. Installation

Install both libraries:
```
npm install @altanlabs/database @altanlabs/auth
```

---

## 3. Database Usage

### 3.1 Quick Start

```jsx
import { DatabaseProvider, useDatabase } from "@altanlabs/database";

const config = {
  API_BASE_URL: "https://api.altan.ai/galaxia/hook/a9lcf",
  SAMPLE_TABLES: {
    todos: "550e8400-e29b-41d4-a716-446655440000"
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

### 3.2 Basic Hook Example

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
          <button onClick={() => removeRecord(todo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3.3 Advanced Query Usage

```jsx
function CompletedTodoList() {
  const { records, isLoading, error } = useDatabase("todos", {
    filters: [{ field: "completed", operator: "eq", value: true }],
    sort: [{ field: "created_at", direction: "desc" }],
    limit: 10,
    fields: ["id", "text", "completed", "created_at"],
    amount: "all"
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

### 3.4 Bulk Operations

```jsx
const { addRecords, removeRecords } = useDatabase("todos");

await addRecords([
  { text: "Todo 1", completed: false },
  { text: "Todo 2", completed: false }
]);

await removeRecords(["id1", "id2"]);
```

### 3.5 Attachments

```jsx
// Upload new attachments
await addRecord({
  title: "Document",
  attachments: [
    {
      file_name: "document.pdf",
      mime_type: "application/pdf",
      file_content: "base64_encoded_content..."
    }
  ]
});
```

```jsx
// Update attachments - keep existing and add new
await modifyRecord(recordId, {
  attachments: [
    { id: "existing_media_1" },
    { id: "existing_media_2" },
    {
      file_name: "new.pdf",
      mime_type: "application/pdf",
      file_content: "base64_encoded_content..."
    }
  ]
});
```

```jsx
// Remove all attachments
await modifyRecord(recordId, { attachments: [] });
```

### 3.6 Pagination

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

### 3.7 Best Practices

Lift queries to parent components when possible to avoid multiple identical queries. Use batch operations for creating or removing multiple records. Use the `enabled` option to prevent unnecessary queries. Only request needed fields and consider pagination for large datasets.

---

## 4. Auth Usage

### 4.1 Setup

```jsx
import "@altanlabs/auth/dist/styles.css";
import { AuthProvider } from "@altanlabs/auth";

function App() {
  return (
    <AuthProvider tableId="your-users-table-id">
      <YourApp />
    </AuthProvider>
  );
}
```

### 4.2 Sign In

```jsx
import { SignIn } from "@altanlabs/auth";

function SignInPage() {
  return (
    <SignIn
      appearance={{ theme: "dark" }}
      companyName="Your Company"
      signUpUrl="/sign-up"
      withSignUp
      routing="path"
    />
  );
}
```

### 4.3 Sign Up

```jsx
import { SignUp } from "@altanlabs/auth";

function SignUpPage() {
  return (
    <SignUp
      appearance={{ theme: "dark" }}
      companyName="Your Company"
      signInUrl="/sign-in"
      withSignIn
      routing="path"
    />
  );
}
```

### 4.4 User Profile

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

### 4.5 Logout

```jsx
import { Logout } from "@altanlabs/auth";

function NavBar() {
  return (
    <Logout
      appearance={{ theme: "dark" }}
      onLogout={() => console.log("User logged out")}
    />
  );
}
```

### 4.6 Using the Hook

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

---

## 5. Combining Database and Auth

1. Wrap your app with **both** `AuthProvider` and `DatabaseProvider`.
2. Use `useAuth` for authentication and user state.
3. Use `useDatabase` for data fetching and mutations.

```jsx
import { AuthProvider } from "@altanlabs/auth";
import { DatabaseProvider } from "@altanlabs/database";

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

---

## 6. Performance Tips

- Avoid infinite query loops by lifting hooks to parent components.  
- Enable or disable queries based on the presence of needed data (use `enabled` in `useDatabase`).  
- Use `addRecords` and `removeRecords` for bulk operations.  
- Request only required fields with the `fields` option.  
- Use proper pagination for large datasets.

---

## 7. License

All libraries under the **@altanlabs** scope use the MIT License. Feel free to fork and adapt as needed.

---

This merged guide should give you all the essentials for integrating **@altanlabs/database** and **@altanlabs/auth** together.**```md
# @altanlabs/database

## Installation
```
npm install @altanlabs/database
```

## Provider Setup
```jsx
import { DatabaseProvider } from "@altanlabs/database";

const config = {
  API_BASE_URL: "https://api.altan.ai/galaxia/hook/a9lcf",
  SAMPLE_TABLES: {
    todos: "550e8400-e29b-41d4-a716-446655440000"
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

## Basic Hook
```jsx
import { useDatabase } from "@altanlabs/database";

function TodoList() {
  const { records, isLoading, error, addRecord, modifyRecord, removeRecord } =
    useDatabase("todos");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
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
    </>
  );
}
```

## Query Options

You can pass an optional second parameter to `useDatabase(tableName, options)` for filtering, sorting, pagination, and more:

- **filters**: An array of filter objects to narrow results.

  ```js
  {
    field: string,        // The field name to filter by
    operator: string,     // e.g. "eq", "ne", "gte", "lte", "in", "nin"
    value: any            // The filter value (string, array, etc.)
  }
  ```

- **sort**: An array of sort objects.

  ```js
  {
    field: string,
    direction: "asc" | "desc"
  }
  ```

- **limit**: Number of records per page.
- **amount**: How many records to fetch:
  - `"all"` (default) returns all matching records (paged).
  - `"first"` returns only the first matching record.
  - `"one"` returns exactly one matching record (throws an error if none or multiple).
- **pageToken**: String token for fetching the next page manually.
- **fields**: An array of field names to fetch. Defaults to all fields.
- **enabled**: Boolean controlling whether the query runs automatically.

### Advanced Query Example
```jsx
function CompletedTodoList() {
  const { records, isLoading, error } = useDatabase("todos", {
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {records.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <span>{todo.created_at}</span>
        </div>
      ))}
    </>
  );
}
```

### Complex Filters Example
```jsx
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
    fields: ["id", "title", "status", "priority", "due_date"],
    amount: "all"
  });

  return (
    <ul>
      {records.map(project => (
        <li key={project.id}>{project.title} ({project.status}, priority {project.priority})</li>
      ))}
    </ul>
  );
}
```

### Refreshing with New Query
```jsx
function RefreshableList() {
  const { records, refresh } = useDatabase("todos");
  
  const handleRefresh = () => {
    refresh({
      filters: [{ field: "status", operator: "eq", value: "active" }],
      sort: [{ field: "created_at", direction: "desc" }],
      limit: 10
    });
  };

  return (
    <>
      <button onClick={handleRefresh}>Refresh with new query</button>
      {records.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
}
```

## Bulk Operations
```jsx
const { addRecords, removeRecords } = useDatabase("todos");

await addRecords([
  { text: "Todo 1", completed: false },
  { text: "Todo 2", completed: false }
]);

await removeRecords(["id1", "id2"]);
```

## Attachments
```jsx
// Upload new attachments
await addRecord({
  title: "Document",
  attachments: [
    {
      file_name: "document.pdf",
      mime_type: "application/pdf",
      file_content: "base64_encoded_content..."
    }
  ]
});
```

```jsx
// Keep existing media, add new
await modifyRecord(recordId, {
  attachments: [
    { id: "existing_media_1" },
    {
      file_name: "new.pdf",
      mime_type: "application/pdf",
      file_content: "base64_encoded_content..."
    }
  ]
});
```

```jsx
// Remove all attachments
await modifyRecord(recordId, { attachments: [] });
```

## Pagination
```jsx
function PaginatedList() {
  const { records, nextPageToken, fetchNextPage } = useDatabase("todos");

  return (
    <>
      {records.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      {nextPageToken && <button onClick={fetchNextPage}>Load More</button>}
    </>
  );
}
```

## Performance Tips
- **Lift queries** to parent components to avoid multiple identical queries.
- Use the **`enabled`** option to control when a query should run.
- **Batch** operations with `addRecords`/`removeRecords`.
- **Paginate** large datasets, request only needed fields with `fields`.
- Avoid re-render loops (e.g., do not refresh on every render).

---

# @altanlabs/auth

## Installation
```
npm install @altanlabs/auth
```

## Provider Setup
```jsx
import "@altanlabs/auth/dist/styles.css";
import { AuthProvider } from "@altanlabs/auth";

function App() {
  return (
    <AuthProvider tableId="your-users-table-id">
      <YourApp />
    </AuthProvider>
  );
}
```

## Sign In in a Dedicated Page
```jsx
import { SignIn, useAuth } from "@altanlabs/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function SignInPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <SignIn
      appearance={{ theme: "dark" }}
      companyName="Your Company"
      signUpUrl="/sign-up"
      withSignUp
      routing="path"
    />
  );
}

export default SignInPage;
```

## Sign Up in a Dedicated Page
```jsx
import { SignUp, useAuth } from "@altanlabs/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function SignUpPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <SignUp
      appearance={{ theme: "dark" }}
      companyName="Your Company"
      signInUrl="/sign-in"
      withSignIn
      routing="path"
    />
  );
}

export default SignUpPage;
```

## User Profile
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

export default ProfilePage;
```

## Logout
```jsx
import { Logout } from "@altanlabs/auth";

function NavBar() {
  return (
    <Logout
      appearance={{ theme: "dark" }}
      onLogout={() => console.log("User logged out")}
    />
  );
}

export default NavBar;
```

## Using the Hook
```jsx
import { useAuth } from "@altanlabs/auth";

function ProfileButton() {
  const { user, logout } = useAuth();

  if (!user) {
    return <button onClick={() => (window.location.href = "/login")}>Sign In</button>;
  }

  return (
    <>
      <span>Welcome, {user.name}!</span>
      <button onClick={logout}>Logout</button>
    </>
  );
}

export default ProfileButton;
```

---

# Combined Setup

To integrate both libraries into your application:

```jsx
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

export default Root;
```
