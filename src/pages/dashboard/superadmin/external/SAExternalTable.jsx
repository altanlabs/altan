import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { LicenseManager } from '@ag-grid-enterprise/core';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { useTheme } from '@mui/material';

import { fetchResourceType } from './helpers/api';
import { useExternalData } from './provider/SAExternalDataProvider';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowGroupingModule,
  GridChartsModule,
  MenuModule,
  ClipboardModule,
  MasterDetailModule,
]);

LicenseManager.setLicenseKey(
  'Altan_Products[v3][][0102]_MjA4MjY3MjAwMDAwMA==b79026526b81b3a5d7175371f58a75bd',
);

const toCapitalCase = (str, char = '_', sep = '') =>
  str
    .toLowerCase()
    .split(char)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(sep);

// const allProperties = (action) => {
//   if (!action) {
//     return {};
//   }
//   const properties = {
//     ...(action?.headers?.properties || {}),
//     ...(action?.path_params?.properties || {}),
//     ...(action?.query_params?.properties || {}),
//     ...(action?.body?.properties || {})
//   };
//   const required = [
//     ...(action?.headers?.required || []),
//     ...(action?.path_params?.required || []),
//     ...(action?.query_params?.required || []),
//     ...(action?.body?.required || [])
//   ];
//   return {
//     properties,
//     required
//   }
// };

const SAExternalTable = ({ index }) => {
  const theme = useTheme();
  const [resourceType, setResourceType] = useState(null);
  const { data: externalData } = useExternalData();

  const {
    resource_id,
    data,
    // ...otherParams
  } = useMemo(() => externalData[index] ?? {}, [index, externalData]);

  // console.log("data", data, otherParams, resourceType);

  useEffect(() => {
    if (!!resource_id) {
      fetchResourceType(resource_id)
        .then((resource) => setResourceType(resource))
        .catch((e) => console.error(e));
    }
  }, [resource_id]);

  const columns = useMemo(() => {
    if (!resourceType?.full_schema?.properties) {
      return [];
    }

    const keys = Object.keys(resourceType?.full_schema?.properties);
    return [
      ...keys.sort().map((key) => ({
        field: key,
        // cellRenderer: JsonCellRenderer,
        floatingFilter: true,
        tooltipField: key,
      })),
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: '40px',
        // cellStyle: style,
        pinned: 'left',
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      // {
      //   headerName: 'Actions',
      //   // cellRenderer: actionCellRenderer,
      //   editable: false,
      //   filter: false,
      //   sortable: false,
      //   width: 110,
      //   pinned: 'left',
      //   suppressMenu: true
      // }
    ];
  }, [resourceType?.full_schema?.properties]);

  const getContextMenuItems = useCallback(
    (params) => {
      // console.log("params", params.node.data, resourceType.connection_type_id);
      if (!resourceType?.actions) {
        return [];
      }
      return [
        ...resourceType.actions
          .filter((a) => {
            // if (a.action.)
            // a.mapping = {
            //   p: {
            //     name: "[$].name"
            //   }
            // }
            // a.resource_id
            // if (a.a)
            // console.log("filtering action:", a, allProperties(a.action));
            return true;
          })
          .map((a) => {
            return {
              name: toCapitalCase(a.action.name, '.', ' '),
              tooltip: a.action.description,
            };
          }),
        'copy',
        'copyWithHeaders',
        'paste',
        'export',
      ];
    },
    [resourceType?.actions],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    [],
  );

  const detailCellRendererParams = useMemo(() => {
    return {
      // provide the Grid Options to use on the Detail Grid
      detailGridOptions: {
        columnDefs: [{ field: 'callId' }, { field: 'direction' }, { field: 'number' }],
      },
      // get the rows for each Detail Grid
      getDetailRowData: (params) => {
        params.successCallback(params.data.callRecords);
      },
    };
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div
      className={theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
      style={{
        width: '100%',
        height: '100%',
        paddingRight: 5,
        paddingLeft: 5,
        // paddingX: 5
      }}
    >
      <AgGridReact
        className=" "
        rowData={data}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        masterDetail={true}
        detailRowAutoHeight={true}
        detailCellRendererParams={detailCellRendererParams}
        // frameworkComponents={frameworkComponents}
        // onGridReady={handleGridReady}
        rowSelection="multiple"
        // onSelectionChanged={onSelectionChanged}
        tooltipShowDelay={1000}
        enableBrowserTooltips={true}
        tooltipHideDelay={5000}
        getContextMenuItems={getContextMenuItems}
      />
    </div>
  );
};

export default memo(SAExternalTable);
