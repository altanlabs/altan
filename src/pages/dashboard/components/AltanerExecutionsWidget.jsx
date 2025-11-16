import { Card, Typography, Skeleton, useTheme } from '@mui/material';
import { AgCharts as AgChartsEnterprise } from 'ag-charts-enterprise';
import { AgCharts } from 'ag-charts-react';
import React, { memo, useMemo } from 'react';

import { useSelector } from '../../../redux/store.ts';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

AgChartsEnterprise.setLicenseKey(
  'Altan_Products[v3][][0102]_MjA4MjY3MjAwMDAwMA==b79026526b81b3a5d7175371f58a75bd',
);

// Selector to get altaners
const selectAltaners = (state) => state.general.account.altaners;
const selectWorkflows = (state) => state.general.account?.workflows;
const selectWorkflowsLoading = (state) => state.general.accountAssetsLoading.workflows;

const AltanerExecutionsWidget = () => {
  const theme = useTheme();
  const workflows = useSelector(selectWorkflows);
  const altaners = useSelector(selectAltaners);
  const isLoading = useSelector(selectWorkflowsLoading);
  console.log('workflows', workflows);
  const filteredWorkflows = useMemo(() => {
    if (!workflows) {
      return [];
    }
    return workflows.filter((workflow) =>
      workflow.executions?.items?.some((exec) => exec.credits && exec.credits > 0),
    );
  }, [workflows]);

  // Create a map from the altaners array
  const altanerMap = useMemo(() => {
    const map = {};
    altaners.forEach((altaner) => {
      map[altaner.id] = altaner.name;
    });
    return map;
  }, [altaners]);
  console.log('altanerMap', altanerMap);
  // Prepare time-series data for the chart
  const chartData = useMemo(() => {
    const dataMap = {};

    filteredWorkflows.forEach((workflow) => {
      workflow.executions?.items?.forEach((exec) => {
        if (exec.credits && exec.credits > 0) {
          const date_creation = new Date(exec.date_creation);
          const dateKey = date_creation.toISOString().split('T')[0];
          const altanerName = altanerMap[exec.altaner_id] || `Altaner ${exec.altaner_id}`;

          if (!dataMap[dateKey]) {
            dataMap[dateKey] = { date_creation: new Date(dateKey) };
          }

          if (!dataMap[dateKey][altanerName]) {
            dataMap[dateKey][altanerName] = 0;
          }

          dataMap[dateKey][altanerName] += exec.credits;
        }
      });
    });

    const chartDataArray = Object.values(dataMap).sort((a, b) => a.date_creation - b.date_creation);

    return chartDataArray;
  }, [filteredWorkflows, altanerMap]);

  // Extract unique altaner names for the chart series
  const altanerNames = useMemo(() => {
    const names = new Set();
    chartData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== 'date_creation') {
          names.add(key);
        }
      });
    });
    return Array.from(names);
  }, [chartData]);

  // Define AG Charts options with smooth interpolation
  const chartOptions = useMemo(
    () => ({
      title: {
        text: 'Credit Consumption Over Time by Altaner',
        fontSize: 18,
      },
      theme: theme.palette.mode === 'dark' ? 'ag-default-dark' : 'ag-default',
      data: chartData,
      autoSize: true,
      animation: {
        duration: 1000,
      },
      series: altanerNames.map((name) => ({
        type: 'bar',
        xKey: 'date_creation',
        yKey: name,
        yName: name,
        strokeWidth: 2,
        fillOpacity: 0.7,
        stacked: true,
        connectMissingData: true,
        interpolation: { type: 'smooth', tension: 0.9 },
        tooltip: {
          renderer: ({ datum, xKey, yKey, yName }) => ({
            title: datum[xKey].toLocaleDateString(),
            content: `${yName}: ${Number(datum[yKey]).toFixed(2)} Credits`,
          }),
        },
      })),
      axes: [
        {
          type: 'time',
          position: 'bottom',
          title: { text: 'Date' },
          label: {
            format: '%Y-%m-%d',
          },
        },
        {
          type: 'number',
          position: 'left',
          title: { text: 'Credits Consumed' },
          label: {
            formatter: (params) => `${Number(params.value).toFixed(2)}`,
          },
        },
      ],
      legend: {
        position: 'top',
        spacing: 20,
      },
      tooltip: {
        enabled: true,
        titleFontSize: 14,
        bodyFontSize: 12,
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    }),
    [chartData, theme.palette.mode, altanerNames],
  );
  if (!altaners) return null;
  return (
    <Card>
      {isLoading ? (
        <>
          <Skeleton
            variant="rectangular"
            height={40}
            width="100%"
            sx={{ mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={300}
            width="100%"
          />
        </>
      ) : filteredWorkflows.length === 0 ? (
        <Typography>No executions with credits available.</Typography>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '20%',
            fontFamily: 'Lato, sans-serif',
          }}
        >
          <AgCharts
            options={chartOptions}
            style={{
              width: '100%',
              height: '600px',
            }}
          />
        </div>
      )}
    </Card>
  );
};

export default memo(AltanerExecutionsWidget);
