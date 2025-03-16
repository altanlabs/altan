import { FetchOptions, RootState, TableHookAPI, TablesHookReturn } from "src/store/types";
import { useRecord } from "./useRecord";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useRecords } from "./useRecords";

export function useTables(): TablesHookReturn {
  // Possibly pull from a Redux store or context that enumerates known tables
  const { tables } = useSelector((state: RootState) => state.tables);

  // Return an object with:
  // {
  //   [tableName]: {
  //     useRecords,
  //     useRecord,
  //     createRecord,
  //     updateRecord,
  //     deleteRecord,
  //     // ...
  //   }
  // }
  
  // We’ll define how we implement these in the next sections.
  // For demonstration, imagine we build a "tablesApi" object dynamically.
  
  const tablesApi = useMemo(() => {
    return Object.keys(tables.byName).reduce((acc, tableName) => {
      acc[tableName] = createTableApi(tableName);
      return acc;
    }, {} as Record<string, ReturnType<typeof createTableApi>>);
  }, [tables]);

  return tablesApi;
}

// A small helper that returns an API for a specific tableName
function createTableApi(tableName: string): TableHookAPI {
  return {
    useRecords: (options?: FetchOptions) => useRecords(tableName, options),
    useRecord: (recordId: string) => useRecord(tableName, recordId)
  };
}
