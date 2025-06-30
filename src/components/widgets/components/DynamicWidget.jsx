
import { Card,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';

import WidgetRenderer from '../WidgetRenderer';

const DynamicWidget = ({ widget }) => {
  const { innerWidgetType, innerWidgetMeta, apiConfig, mapping } = widget.meta_data;
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  const memoizedApiConfig = useMemo(() => apiConfig, [JSON.stringify(apiConfig)]);

  useEffect(() => {
    const fetchData = async () => {
      const { method, url, params, headers } = memoizedApiConfig;
      try {
        const response = await axios({ method, url, params, headers });
        setApiData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, [memoizedApiConfig]);

  if (error) {
    return (
      <Card style={{ width: '100%', height: '275px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Error: Could not fetch data
        </div>
      </Card>
    );
  }

  const getNestedObject = (nestedObj, pathArr) => {
    return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
  };

  const mapData = (apiData) => {
    const mapped = {};
    for (const [key, value] of Object.entries(mapping)) {
      const path = value.split('.');
      mapped[key] = getNestedObject(apiData, path);
    }
    return mapped;
  };

  const mappedData = apiData ? (mapping ? mapData(apiData) : apiData) : null;
  const widgetData = mappedData
    ? {
        type: innerWidgetType,
        meta_data: { ...mappedData, ...innerWidgetMeta },
      }
    : null;

  return widgetData ? <WidgetRenderer message={{ widget: widgetData }} isChild /> :
      <Card style={{ width: '100%', height: '275px' }}>
        <CircularProgress style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </Card>;
};

export default DynamicWidget;
