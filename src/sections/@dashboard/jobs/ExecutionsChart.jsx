import { useTheme } from '@mui/material';
import { useMemo } from 'react';

import Chart, { StyledChart, useChart } from '@components/chart';

const ExecutionsChart = ({ executions }) => {
  const theme = useTheme();

  const series = [
    {
      name: 'Executions',
      data: executions.map((exec) => ({
        x: exec.x, // Using the x property as the date
        y: exec.y, // Using the y property for the value
      })),
    },
  ];

  const options = useMemo(
    () => ({
      colors: [theme.palette.info.main, theme.palette.error.main, theme.palette.warning.main],
      chart: {
        animations: {
          enabled: true,
        },
        sparkline: {
          enabled: true,
        },
      },
      stroke: {
        width: 2,
      },
      tooltip: {
        x: {
          show: false, // Enable the x tooltip
          format: 'yyyy-MM-dd', // Format the x value (date)
        },
        y: {
          formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {
            const date = w.config.series[seriesIndex].data[dataPointIndex].x;
            return `${date}: ${value} executions`;
          },
          title: {
            formatter: () => '',
          },
        },
        marker: {
          show: false,
        },
      },
      xaxis: {
        type: 'datetime',
      },
      legend: {
        show: false,
      },
    }),
    [theme.palette.error.main, theme.palette.info.main, theme.palette.warning.main],
  );

  const chartOptions = useChart(options);

  return (
    <>
      <StyledChart />
      <Chart
        type="area"
        series={series}
        options={chartOptions}
        height={40}
      />
    </>
  );
};

export default ExecutionsChart;
