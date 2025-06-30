// src/components/databases/fields/ReferenceField.jsx
import SearchIcon from '@mui/icons-material/Search';
import { Chip } from '@mui/material';
import { useState, useRef, forwardRef, useImperativeHandle, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';

import {
  queryTableRecords,
  selectTableRecords,
  selectTablesByBaseId,
  createRecordPrimaryValueSelector,
} from '../../../../../redux/slices/bases';
import { dispatch } from '../../../../../redux/store';

export const ReferenceField = forwardRef((props, ref) => {
  ReferenceField.displayName = 'ReferenceField';
  const [search, setSearch] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const [params, setParams] = useState(null);
  const refInput = useRef(null);
  const containerRef = useRef(null);

  const baseId = props.colDef?.cellEditorParams?.baseId;
  const foreignTableName =
    props.colDef?.cellEditorParams?.referenceOptions?.reference_options?.foreign_table;

  // Get the table ID from the table name using the tables selector
  const tables = useSelector((state) => selectTablesByBaseId(state, baseId));
  const foreignTable = tables.find((table) => table.db_name === foreignTableName);
  const foreignTableId = foreignTable?.id;

  const referenceRecords = useSelector((state) =>
    foreignTableId ? selectTableRecords(state, foreignTableId) : [],
  );

  useEffect(() => {
    if (foreignTableId && foreignTableId !== props.tableId) {
      dispatch(
        queryTableRecords(foreignTableId, {
          offset: 0,
          limit: 50,
        }),
      );
    }
  }, [foreignTableId, props.tableId]);

  useImperativeHandle(ref, () => ({
    getValue() {
      console.log('getValue called, returning:', selectedValues[0]);
      return selectedValues[0] || null;
    },

    isPopup() {
      return true;
    },

    getPopupPosition() {
      return 'under';
    },

    afterGuiAttached(params) {
      console.log('afterGuiAttached called with params:', params);
      if (refInput.current) {
        refInput.current.focus();
      }
    },

    init(params) {
      console.log('init called with params:', params);
      setParams(params);
      const initialValue = params.value;
      if (initialValue) {
        setSelectedValues(Array.isArray(initialValue) ? initialValue : [initialValue]);
      }
    },

    getGui() {
      return containerRef.current;
    },
  }));

  const referenceOptions = props.colDef?.cellEditorParams?.referenceOptions?.reference_options;
  const tableName = referenceOptions?.foreign_table_name || 'Record';

  useEffect(() => {
    const initialValues = props.value
      ? Array.isArray(props.value)
        ? props.value
        : [props.value]
      : [];
    setSelectedValues(initialValues);
  }, [props.value]);

  const handleSelect = (record) => {
    const newValue = record.id;
    console.log('Setting new single value:', newValue);
    setSelectedValues([newValue]); // Keep as array internally for consistent rendering

    if (params?.api) {
      console.log('Using AG Grid API to set value');
      const node = params.node;
      const colId = params.column.colId;
      params.api.stopEditing();
      params.api.applyTransaction({
        update: [
          {
            ...node.data,
            [colId]: newValue,
          },
        ],
      });
    } else {
      console.log('Using props methods to set value');
      props.onValueChange(newValue);
      props.stopEditing();
    }
  };

  const handleDelete = (valueToDelete) => {
    const newValue = selectedValues.filter((value) => value !== valueToDelete);
    setSelectedValues(newValue);
    props.onValueChange(newValue);
  };

  const handleDone = () => {
    props.onValueChange(selectedValues);
    props.stopEditing();
  };

  const RecordLabel = memo(({ record }) => {
    RecordLabel.displayName = 'RecordLabel';
    const primaryValue = useSelector(
      createRecordPrimaryValueSelector(baseId, foreignTableId, record.id),
    );
    return <span>{String(primaryValue ?? '')}</span>;
  });

  const selectedPrimaryValues = useSelector((state) =>
    selectedValues.map((value) =>
      createRecordPrimaryValueSelector(baseId, foreignTableId, value)(state),
    ),
  );

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-[400px]"
    >
      {selectedValues.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-2">
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((value, index) => (
              <Chip
                key={value}
                label={selectedPrimaryValues[index]}
                size="small"
                onDelete={() => handleDelete(value)}
                sx={{
                  height: '24px',
                  '& .MuiChip-label': {
                    fontSize: '0.75rem',
                    lineHeight: '24px',
                    px: 1,
                  },
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
        <SearchIcon className="text-gray-400 w-5 h-5" />
        <input
          ref={refInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tableName}s...`}
          className="w-full border-none outline-none text-sm placeholder:text-gray-400 bg-transparent"
        />
      </div>

      <div className="max-h-[300px] overflow-auto p-2">
        {referenceRecords
          ?.filter((record) => {
            if (!record) return false;

            const searchableValue = String(record.name ?? record.id ?? '').toLowerCase();

            const searchTerm = search.toLowerCase();
            return searchableValue.includes(searchTerm);
          })
          .map((record) => (
            <div
              key={record.id}
              onClick={() => handleSelect(record)}
              className={`
                p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                cursor-pointer text-sm flex items-center justify-between
                ${selectedValues.includes(record.id) ? 'bg-gray-50 dark:bg-gray-700' : ''}
              `}
            >
              <RecordLabel record={record} />
            </div>
          ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex justify-end">
        <button
          onClick={handleDone}
          className="px-4 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Done
        </button>
      </div>
    </div>
  );
});

export default ReferenceField;
