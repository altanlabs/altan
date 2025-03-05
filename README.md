# altanlabs Monorepo

Welcome to the altanlabs Open Source Project! This monorepo contains a suite of packages that empower developers to build modern, scalable, and interactive applications. Each package focuses on a distinct aspect of application development, from database integration and authentication to UI components and layout blocks.

## Packages in This Monorepo

- **@altanlabsdatabase**  
  A robust TypeScript-based database integration package. It provides utilities for configuring and managing database connections, interacting with backend APIs via axios, and integrating Redux for state management.

- **@altanlabs/auth**  
  A user authentication and authorization module. It simplifies the process of integrating various auth strategies (such as JWT, OAuth) into your application.

- **@altanlabs/components**  
  A library of reusable UI components designed for rapid development. These components are styled, responsive, and extensible, promoting a consistent look-and-feel across your projects.

- **@altanlabs/blocks**  
  Pre-designed layout blocks that allow you to quickly assemble complex UIs. Combine these blocks to create custom dashboards, landing pages, or admin panels with ease.

## Getting Started

### Prerequisites

- Node.js (preferably the latest LTS version)
- npm or Yarn

### Local Development

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-org/altanlabs-monorepo.git
   cd altanlabs-monorepo
   ```

2. **Install Dependencies:**

   If you're using Yarn Workspaces or npm workspaces, run:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Build All Packages:**

   Use the provided workspace scripts to build every package:

   ```bash
   npm run build
   ```

   This command compiles TypeScript files and generates the distributable code (e.g., in each package's `dist` folder).

4. **Run in Development Mode:**

   For faster iteration, you can run individual packages in watch mode. Refer to each package's README for specific instructions.

## Usage

Each package is published separately and can be installed as needed in your projects. For example:

- **Database Module:**
  
  ```bash
  npm install @altanlabs/database
  ```

  Then, in your React application:

  ```typescript
  import { setDatabaseConfig, DatabaseProvider, createAltanDB, fetchTableRecords } from "@altanlabs/database";

  // Configure the database
  setDatabaseConfig({
    API_BASE_URL: "https://api.example.com",
    SAMPLE_TABLES: {
      users: "your-users-table-id",
      posts: "your-posts-table-id"
    }
  });

  // Wrap your app with DatabaseProvider
  const App = () => (
    <DatabaseProvider>
      {/* Your app components */}
    </DatabaseProvider>
  );

  // Example usage: fetching records
  // dispatch(fetchTableRecords({ tableName: "users", queryParams: { limit: 20 } }));
  ```

- **Authentication Module:**  
  Refer to the `@altanlabs/auth` package for installation and usage instructions to handle user login, registration, and secure sessions.

- **Components and Blocks:**  
  Install these packages similarly and import specific UI elements to rapidly develop elegant user interfaces.

## Example: Dashboard Layout

One of the goals of these packages is to enable developers to quickly create sophisticated dashboards. A typical dashboard may include:

- **Multiple Chart Types Using Recharts:** Leverage data visualization components.
- **Card-Based Layouts:** Organize information into easily digestible segments.
- **Activity Feeds and Quick Action Buttons:** Enhance user engagement and interactivity.

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and open a Pull Request.

Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.


# @altanlabs/database

A robust TypeScript-based database integration package for the Altan ecosystem. This package provides flexible and powerful utilities for configuring and managing database connections, interacting with backend APIs via axios, and integrating Redux state management in React applications. The library relies on explicit, prop-based configuration and a single axios instance that's injected into your Redux async thunks.

---

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [DatabaseProvider](#databaseprovider)
  - [Axios Instance Creation](#axios-instance-creation)
  - [Redux Tables Slice](#redux-tables-slice)
  - [Querying Records](#querying-records)
- [Advanced Topics](#advanced-topics)
  - [Dashboard Example](#dashboard-example)
  - [Redux Store Structure](#redux-store-structure)
  - [Available Tables](#available-tables)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Installation

Install the package via npm:

```bash
npm install @altanlabs/database
```

Or using yarn:

```bash
yarn add @altanlabs/database
```

---

## Configuration

The configuration is now passed directly to the `DatabaseProvider` component. Define your configuration object in your application entry point. For example:

```typescript
// src/config.ts
export const databaseConfig = {
  API_BASE_URL: "https://api.example.com",
  SAMPLE_TABLES: {
    // Pre-configured tables
    users: "1b52a5c4-ce93-4790-aa2a-d186daa2068d",
    posts: "d8812981-b246-4de4-8ef9-40fa8a7dbbda"
  }
};
```

---

## Usage

### DatabaseProvider

Wrap your application in the `DatabaseProvider` and pass your configuration via the `config` prop. This provider creates a single axios instance and injects it into all async thunk actions.

```tsx
// src/App.tsx
import React from "react";
import { DatabaseProvider } from "@altanlabs/database";
import { databaseConfig } from "./config";
import YourApplication from "./YourApplication";

const App = () => (
  <DatabaseProvider config={databaseConfig}>
    <YourApplication />
  </DatabaseProvider>
);

export default App;
```

### Axios Instance Creation

The library exports a `createAltanDB` function that creates an axios instance using the provided API base URL. However, you do not need to call this function directly. The `DatabaseProvider` calls it once using the configuration supplied to create the axios instance that is injected via Redux Thunk's extra argument.

### Redux Tables Slice

The package exposes several Redux actions and thunks (such as `fetchTableRecords`, `createRecord`, etc.) to interact with table records. These thunks automatically use the injected axios instance.

#### Example: Fetching Table Records

```typescript
import { useDispatch } from "react-redux";
import { fetchTableRecords } from "@altanlabs/database";

const dispatch = useDispatch();

// Fetch records from the "users" table with a limit of 20 records
dispatch(fetchTableRecords({
  tableName: "users",
  queryParams: { limit: 20 }
}));
```

#### Example: Creating a Record

```typescript
import { createRecord } from "@altanlabs/database";

dispatch(createRecord({
  tableName: "users",
  record: {
    username: "john_doe",
    email: "john@example.com"
  }
}));
```

---

### Querying Records

The database supports advanced querying capabilities with filtering, sorting, and pagination. When querying records, you can specify various options using the `queryParams` field. These options include:

- **Filters**  
  Apply one or more criteria to narrow down the records.  
  **Operators available:**
  - `eq` - Equals
  - `neq` - Not equals (includes NULL values)
  - `gt` - Greater than
  - `gte` - Greater than or equal
  - `lt` - Less than
  - `lte` - Less than or equal
  - `contains` - Case-insensitive text search
  - `startswith` - Case-insensitive prefix search
  - `endswith` - Case-insensitive suffix search

- **Sorting**  
  Sort by multiple fields using the `sort` parameter. Each sort item requires a `field` and a `direction` ("asc" or "desc").  
  If no sorting is provided, the default is sorting by `id` in ascending order.

- **Pagination**  
  Cursor-based pagination is used to efficiently load large data sets.
  - Use `limit` to control the number of records per page.  
  - A `pageToken` (returned as `nextPageToken`) will be provided if more records exist.  
  - Pass the `pageToken` in subsequent requests to retrieve the next set of records.

- **Fields & Amount**  
  Specify a subset of fields to retrieve using `fields`.  
  The `amount` parameter determines how many records to return. It defaults to `"all"` if not provided and can be explicitly set to `"all"`, `"first"`, or `"one"`.

#### Examples

```typescript
// Basic query
dispatch(fetchTableRecords({
  tableName: "users",
  queryParams: { 
    limit: 20 
  }
}));

// Advanced query with filters and sorting
dispatch(fetchTableRecords({
  tableName: "users",
  queryParams: {
    filters: [
      { field: "username", operator: "contains", value: "john" },
      { field: "signup_date", operator: "gte", value: "2024-01-01" }
    ],
    sort: [
      { field: "created_time", direction: "desc" }
    ],
    limit: 20,
    fields: ["id", "username", "email"],
    amount: "all" // Defaults to "all" if not specified
  }
}));

// Pagination example:
// First page fetch:
const firstPage = await dispatch(fetchTableRecords({
  tableName: "users",
  queryParams: { limit: 20 }
}));
// Fetch the next page:
if (firstPage.nextPageToken) {
  dispatch(fetchTableRecords({
    tableName: "users",
    queryParams: {
      limit: 20,
      pageToken: firstPage.nextPageToken
    }
  }));
}
```

---

## Advanced Topics

### Dashboard Example

Integrate the database operations into a larger dashboard application that might feature:
- Multiple chart components using Recharts
- Card-based layouts
- Activity feeds and quick action buttons

### Redux Store Structure

The integrated Redux store uses the following structure:

```javascript
const initialState = {
  tables: {
    byId: {},
    byName: {},
    allIds: [],
  },
  schemas: {
    byTableId: {},
  },
  records: {
    byTableId: {},
  },
  loading: {
    tables: "idle",
    records: "idle",
    schemas: "idle",
  },
  error: null,
  initialized: {} // Tracks whether a table's data has been fetched.
};
```

### Available Tables

Pre-configured tables are defined via the `SAMPLE_TABLES` configuration object:

```javascript
const SAMPLE_TABLES = {
  users: "1b52a5c4-ce93-4790-aa2a-d186daa2068d",
  posts: "d8812981-b246-4de4-8ef9-40fa8a7dbbda",
};
```

---

## API Endpoints

The database components interact with the following API endpoints:

- `GET /table/{table_id}`  
  Retrieve the table schema.

- `POST /table/{table_id}/record/query`  
  Query table records using filters, sorting, and pagination.

- `POST /table/{table_id}/record`  
  Create a new record in the specified table.

- `PATCH /table/{table_id}/record/{record_id}`  
  Update an existing record.

- `DELETE /table/{table_id}/record/{record_id}`  
  Delete a record from the table.

Ensure your backend API conforms to these endpoints and data structures for seamless integration.

---


## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

Happy Coding and Thank You for Contributing to altanlabs!
