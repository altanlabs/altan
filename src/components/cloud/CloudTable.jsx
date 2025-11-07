import { useEffect, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';

import {
  selectTableById,
  selectTableRecords,
  selectTableLoading,
  fetchRecords,
  createRecord,
  updateRecordById,
  deleteRecord,
} from '../../redux/slices/cloud';
import { dispatch, useSelector } from '../../redux/store';
import { GridView } from '../databases/view/grid/GridView';
import Iconify from '../iconify';

const CloudTable = ({ tableId }) => {
  const { cloudId } = useParams();

  // Use ONLY cloud.js selectors
  const table = useSelector((state) => selectTableById(state, cloudId, tableId));
  const records = useSelector((state) => selectTableRecords(state, tableId));
  const isLoading = useSelector((state) => selectTableLoading(state, tableId));

  // Fetch records when table metadata is ready
  useEffect(() => {
    if (!cloudId || !tableId) return;
    if (!table) return; // wait until tables are loaded
    // If we already have records, avoid redundant fetch on mount
    if (Array.isArray(records) && records.length > 0) return;
    dispatch(fetchRecords(cloudId, tableId, { limit: 50 }));
  }, [cloudId, tableId, table?.id]);

  // CRUD handlers
  const handleAddRecord = useCallback(
    async (recordsData) => {
      const data = Array.isArray(recordsData) ? recordsData[0] : recordsData;
      const record = await dispatch(createRecord(cloudId, tableId, data));
      return { records: [record] };
    },
    [cloudId, tableId],
  );

  const handleUpdateRecord = useCallback(
    (recordId, changes) => {
      return dispatch(updateRecordById(cloudId, tableId, recordId, changes));
    },
    [cloudId, tableId],
  );

  const handleDeleteRecords = useCallback(
    (recordIds) => {
      const validIds = recordIds.filter((id) => id !== '+');
      return Promise.all(validIds.map((id) => dispatch(deleteRecord(cloudId, tableId, id))));
    },
    [cloudId, tableId],
  );

  if (isLoading && (!records || records.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-row items-center space-x-4">
          <Iconify
            width={30}
            icon="svg-spinners:blocks-shuffle-3"
          />
          <span className="text-sm text-muted-foreground">Loading table data...</span>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-sm text-muted-foreground">Table not found</span>
      </div>
    );
  }

  // Ensure fields have required properties
  const fields = (table.fields?.items || []).map((field) => ({
    ...field,
    name: field.name || field.db_field_name || '',
    db_field_name: field.db_field_name || field.name || '',
  }));

  return (
    <div className="relative w-full h-full min-w-0">
      <GridView
        table={table}
        fields={fields}
        records={records}
        onAddRecord={handleAddRecord}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecords={handleDeleteRecords}
        baseId={cloudId}
      />
    </div>
  );
};

export default memo(CloudTable);
