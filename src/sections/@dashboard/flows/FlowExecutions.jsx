// import React, { memo, useEffect, useState } from 'react';
// import { Box, useTheme, Chip, Typography } from '@mui/material';
// import { getFlowExecutions, selectCurrentExecution, selectFlowExecutions, selectFlowId } from '../../../redux/slices/flows';
// import { useSelector } from 'react-redux';
// import { dispatch } from '../../../redux/store';
// import { AgGridReact } from '@ag-grid-community/react';
// import { ModuleRegistry } from '@ag-grid-community/core';
// import {
//   ClientSideRowModelModule,
//   ColumnsToolPanelModule,
//   GridChartsModule,
//   RowGroupingModule,
//   MenuModule,
//   ClipboardModule,
//   MasterDetailModule,
//   LicenseManager
// } from "ag-grid-enterprise";
// import { optimai } from '../../../utils/axios';
// import '@ag-grid-community/styles/ag-grid.css';
// import '@ag-grid-community/styles/ag-theme-quartz.css';
// import Iconify from '../../../components/iconify/Iconify';
// import { useNavigate } from 'react-router';
// import SetExecutionRenderer from './executions/SetExecutionRenderer';
// import { formatDistanceToNow, parseISO } from 'date-fns';

// function fToNow(date) {
//   return date
//     ? formatDistanceToNow(new Date(`${date}Z`), {
//       addSuffix: true,
//     })
//     : '';
// }

// const style = {
//   display: 'flex',
//   flexDirection: 'row',
//   alignItems: 'center'
// }

// const DetailPanel = ({ data }) => {
//   const theme = useTheme();
//   const [detailData, setDetailData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchExecutionData = async () => {
//       setLoading(true);
//       try {
//         const response = await optimai.get(`/executions/${data.id}/signed-url`);
//         const signedUrl = response.data.execution.signed_url;
//         const jsonResponse = await fetch(signedUrl);
//         if (!jsonResponse.ok) {
//           throw new Error(`Failed to fetch JSON from signed URL: ${jsonResponse.statusText}`);
//         }
//         const jsonData = await jsonResponse.json();
//         setDetailData(jsonData);
//       } catch (e) {
//         console.error(`Error fetching execution data for ID ${data.id}: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (data.id) {
//       fetchExecutionData();
//     }
//   }, [data.id]);

//   const detailColumns = [
//     {
//       headerName: "Status", field: "status", flex: 1, cellRenderer: (params) => {
//         const status = params.value;
//         const color = status !== 'error' ? 'success' : 'error';
//         return <Chip label={status} color={color} variant='soft' />;
//       }
//     },
//     { headerName: "Executed Tasks", field: "executed_modules_count", flex: 1 },
//     { headerName: "Successful Tasks", field: "successful_modules_count", flex: 1 },
//     { headerName: "Elapsed Time", field: "elapsed_time", flex: 1 },
//     { headerName: "CPU Usage", field: "average_cpu_usage", flex: 1 },
//     { headerName: "Memory Usage", field: "max_memory_usage", flex: 1 },
//   ];

//   if (loading) {
//     return (
//       <div style={{
//         height: '300px',
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center'
//       }}>
//         <Iconify icon="svg-spinners:gooey-balls-2" width={32} />
//       </div>
//     );
//   }

//   return (
//     <div className={theme.palette.mode === "light" ? "ag-theme-quartz" : "ag-theme-quartz-dark"} style={{ height: '100%', width: '100%', padding: '16px' }}>
//       <AgGridReact
//         rowData={Object.values(detailData.executions || {})}
//         columnDefs={detailColumns}
//       />
//     </div>
//   );
// };

// const FlowExecutions = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const flowId = useSelector(selectFlowId);
//   const flowExecutions = useSelector(selectFlowExecutions);
//   const availableExecutions = useSelector(selectCurrentExecution);
//   const initialized = useSelector((state) => state.flows.initialized.executions);
//   const isLoading = useSelector((state) => state.flows.isLoading.executions);

//   console.log("flowExecutions",flowExecutions);
//   useEffect(() => {
//     if (flowId && !initialized && !isLoading) {
//       dispatch(getFlowExecutions(flowId)).catch(() => navigate('/flows'));
//     }
//   }, [flowId, initialized, isLoading, navigate]);

//   const dateRenderer = (params) => (
//     <Typography variant='caption'> {fToNow(params.data.date_creation)}</Typography>
//   );

//   const columns = [
//     {
//       field: 'id',
//       headerName: "Executions",
//       cellRenderer: "agGroupCellRenderer",
//       filter: true
//     },
//     {
//       headerName: "Debug",
//       flex: 1,
//       cellRenderer: SetExecutionRenderer,
//       cellStyle: style
//     },
//     {
//       headerName: "Started",
//       field: "date_creation",
//       flex: 1,
//       cellStyle: style,
//       cellRenderer: dateRenderer,
//       valueGetter: ({ data }) => parseISO(data.date_creation),
//     },
//     {
//       headerName: "Status",
//       field: "status",
//       cellStyle: style,
//       filter: true,
//       flex: 1,
//       cellRenderer: (params) => {
//         const status = params.value;
//         const color = status !== 'error' ? 'success' : 'error';
//         return <Chip label={status} color={color} variant='soft' />;
//       }
//     },
//     {
//       headerName: "Finished At",
//       field: "finished_at",
//       flex: 1,
//       cellStyle: style,
//       cellRenderer: dateRenderer,
//       valueGetter: ({ data }) => parseISO(data.date_creation),
//     },
//     {
//       headerName: "Duration",
//       field: "duration",
//       flex: 1,
//       cellStyle: style,
//       cellRenderer: (params) => {
//         const start = new Date(params.data.date_creation);
//         const end = new Date(params.data.finished_at);
//         const duration = new Date(end - start);
//         const minutes = duration.getUTCMinutes();
//         const seconds = duration.getUTCSeconds();
//         return `${minutes}m ${seconds}s`;
//       }
//     }
//   ];

//   const availableExecutionsIds = Object.keys(availableExecutions || {});

//   const getRowStyle = (params) => {
//     if (availableExecutionsIds.includes(params.data.id)) {
//       return {'background-color': '#44ff4455'};
//     }
//     return null;
//   }

//   return (
//     <Box sx={{ height: '100%', width: '100%', pt: 6 }}>
//       {initialized ? (
//         <div className={theme.palette.mode === "light" ? "ag-theme-quartz" : "ag-theme-quartz-dark"} style={{ height: '100%', width: '100%' }}>
//           <AgGridReact
//             rowData={flowExecutions ?? []}
//             columnDefs={columns}
//             masterDetail={true}
//             detailCellRenderer={DetailPanel}
//             detailCellRendererParams={{
//               getDetailRowData: function (params) {
//                 params.successCallback(params.data.executions);
//               }
//             }}
//             getRowStyle={getRowStyle}
//           />
//         </div>
//       ) : (
//         <div style={{
//           height: '100%',
//           width: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center'
//         }}>
//           <Iconify icon="svg-spinners:gooey-balls-2" width={32} />
//         </div>
//       )}
//     </Box>
//   );
// };

// export default memo(FlowExecutions);
