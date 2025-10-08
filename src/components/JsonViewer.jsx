import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Iconify from './iconify';

const JsonViewer = ({ data, collapsed = false, theme = 'light', maxDepth = 10, currentDepth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getTypeColor = (value) => {
    if (value === null) return theme === 'dark' ? '#f78c6c' : '#e91e63';
    if (typeof value === 'string') return theme === 'dark' ? '#c3e88d' : '#4caf50';
    if (typeof value === 'number') return theme === 'dark' ? '#f78c6c' : '#ff9800';
    if (typeof value === 'boolean') return theme === 'dark' ? '#c792ea' : '#9c27b0';
    return theme === 'dark' ? '#82aaff' : '#2196f3';
  };

  const renderValue = (value, key = null, level = 0) => {
    if (currentDepth >= maxDepth) {
      return (
        <Typography 
          component="span" 
          sx={{ 
            fontStyle: 'italic', 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          [Max depth reached]
        </Typography>
      );
    }

    if (value === null) {
      return (
        <Typography 
          component="span" 
          sx={{ 
            color: getTypeColor(value), 
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          null
        </Typography>
      );
    }

    if (typeof value === 'string') {
      return (
        <Typography 
          component="span" 
          sx={{ 
            color: getTypeColor(value),
            fontSize: '0.875rem'
          }}
        >
          "{value}"
        </Typography>
      );
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <Typography 
          component="span" 
          sx={{ 
            color: getTypeColor(value), 
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          {String(value)}
        </Typography>
      );
    }

    if (Array.isArray(value)) {
      return (
        <JsonArray 
          data={value} 
          level={level} 
          theme={theme} 
          maxDepth={maxDepth}
          currentDepth={currentDepth + 1}
        />
      );
    }

    if (typeof value === 'object') {
      return (
        <JsonObject 
          data={value} 
          level={level} 
          theme={theme} 
          maxDepth={maxDepth}
          currentDepth={currentDepth + 1}
        />
      );
    }

    return (
      <Typography 
        component="span" 
        sx={{ 
          color: 'text.primary',
          fontSize: '0.875rem'
        }}
      >
        {String(value)}
      </Typography>
    );
  };

  if (data === null || data === undefined) {
    return renderValue(data);
  }

  if (typeof data !== 'object') {
    return renderValue(data);
  }

  return (
    <Box sx={{ fontFamily: 'monospace' }}>
      {renderValue(data)}
    </Box>
  );
};

const JsonObject = ({ data, level = 0, theme, maxDepth, currentDepth }) => {
  const [collapsed, setCollapsed] = useState(level > 0);
  const keys = Object.keys(data);
  const isEmpty = keys.length === 0;

  const paddingLeft = level * 16;

  if (isEmpty) {
    return (
      <Typography 
        component="span" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        {'{'}
        {'}'}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          sx={{ 
            width: 20, 
            height: 20, 
            mr: 0.5,
            color: 'text.secondary'
          }}
        >
          <Iconify 
            icon={collapsed ? 'mdi:chevron-right' : 'mdi:chevron-down'} 
            width={14}
          />
        </IconButton>
        <Typography 
          component="span" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          {'{'}
          {collapsed && (
            <Typography 
              component="span" 
              sx={{ 
                color: 'text.disabled', 
                ml: 0.5,
                fontSize: '0.875rem'
              }}
            >
              {keys.length} {keys.length === 1 ? 'property' : 'properties'}
            </Typography>
          )}
          {collapsed && '}'}
        </Typography>
      </Box>

      <Collapse in={!collapsed}>
        <Box sx={{ pl: 2 }}>
          {keys.map((key, index) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography 
                component="span" 
                sx={{ 
                  color: theme === 'dark' ? '#82aaff' : '#1976d2',
                  mr: 1,
                  fontSize: '0.875rem',
                  minWidth: 'fit-content'
                }}
              >
                "{key}":
              </Typography>
              <Box sx={{ flex: 1 }}>
                <JsonViewer 
                  data={data[key]} 
                  theme={theme} 
                  maxDepth={maxDepth}
                  currentDepth={currentDepth}
                />
                {index < keys.length - 1 && (
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    ,
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
        <Typography 
          component="span" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          {'}'}
        </Typography>
      </Collapse>
    </Box>
  );
};

const JsonArray = ({ data, level = 0, theme, maxDepth, currentDepth }) => {
  const [collapsed, setCollapsed] = useState(level > 0);
  const isEmpty = data.length === 0;

  if (isEmpty) {
    return (
      <Typography 
        component="span" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        []
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          sx={{ 
            width: 20, 
            height: 20, 
            mr: 0.5,
            color: 'text.secondary'
          }}
        >
          <Iconify 
            icon={collapsed ? 'mdi:chevron-right' : 'mdi:chevron-down'} 
            width={14}
          />
        </IconButton>
        <Typography 
          component="span" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          [
          {collapsed && (
            <Typography 
              component="span" 
              sx={{ 
                color: 'text.disabled', 
                ml: 0.5,
                fontSize: '0.875rem'
              }}
            >
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </Typography>
          )}
          {collapsed && ']'}
        </Typography>
      </Box>

      <Collapse in={!collapsed}>
        <Box sx={{ pl: 2 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography 
                component="span" 
                sx={{ 
                  color: 'text.disabled',
                  mr: 1,
                  fontSize: '0.875rem',
                  minWidth: 'fit-content'
                }}
              >
                [{index}]:
              </Typography>
              <Box sx={{ flex: 1 }}>
                <JsonViewer 
                  data={item} 
                  theme={theme} 
                  maxDepth={maxDepth}
                  currentDepth={currentDepth}
                />
                {index < data.length - 1 && (
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    ,
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
        <Typography 
          component="span" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          ]
        </Typography>
      </Collapse>
    </Box>
  );
};

export default JsonViewer;
