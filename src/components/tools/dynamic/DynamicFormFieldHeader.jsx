import React, { useCallback, memo, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { m } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';

import { cn } from '@lib/utils';
import { Badge } from '@/components/ui/badge';

import Iconify from '../../iconify';
import IconRenderer from '../../icons/IconRenderer.jsx';

// Helper function to get field title
const getFieldTitle = (schema, fieldKey) => {
  return schema?.title || fieldKey.split('.').slice(-1)[0];
};

// Helper function to format description text
const formatDescription = (schema) => {
  const parts = [];
  if (schema.description) parts.push(schema.description);
  if (schema.type) parts.push(`(${schema.type})`);
  if (schema.default !== undefined) parts.push(String(schema.default));
  return parts.join(' ');
};

// Validation Badge sub-component
const ValidationBadge = ({ isValid }) => (
  <Badge 
    variant={isValid ? "default" : "destructive"}
    className={cn(
      "h-3.5 text-[9px] px-1.5",
      isValid && "bg-emerald-500 hover:bg-emerald-500/80 dark:bg-emerald-600"
    )}
  >
    Required
  </Badge>
);

// Modern AI Toggle sub-component
const AIToggle = ({ value, onChange }) => {
  const isAI = value === 'ai';
  
  const handleToggle = useCallback((mode) => {
    onChange(null, mode);
  }, [onChange]);

  return (
    <div className="relative flex items-center h-7 bg-muted/40 rounded-md p-0.5 gap-0.5">
      {/* Sliding background indicator */}
      <m.div
        className="absolute h-6 rounded-sm bg-background shadow-sm border border-border/40"
        initial={false}
        animate={{
          x: isAI ? 28 : 0,
          width: 28,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      />
      
      {/* Manual option */}
      <Tooltip title="Manual parameter selection" arrow placement="top">
        <button
          type="button"
          onClick={() => handleToggle('fill')}
          className={cn(
            'relative z-10 flex items-center justify-center w-7 h-6 rounded-sm transition-colors',
            !isAI ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label="Manual"
        >
          <Iconify icon="lucide:pencil" width={14} />
        </button>
      </Tooltip>
      
      {/* AI option */}
      <Tooltip title="Let AI fill the parameter" arrow placement="top">
        <button
          type="button"
          onClick={() => handleToggle('ai')}
          className={cn(
            'relative z-10 flex items-center justify-center w-7 h-6 rounded-sm transition-colors',
            isAI ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label="AI Fill"
        >
          <m.div
            animate={isAI ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <Iconify icon="mdi:sparkles" width={14} />
          </m.div>
        </button>
      </Tooltip>
    </div>
  );
};

const DynamicFormFieldHeader = ({
  fieldKey,
  schema,
  required,
  requiredValid = false,
  showSchemaType = false,
  canBeCollapsed = false,
  enableAIFill = false,
  isArrayElement = false,
  onDeleteArrayElement = null,
  dragRef = null,
  dragListeners = null,
  isDragging = false,
  expanded = false,
  // onMoveUpArrayElement = null,
  // onMoveDownArrayElement = null,
  sneakPeek = null,
  isCollapsed = true,
  toggleCollapse = null,
}) => {
  const { setValue } = useFormContext();
  const optionValue = useWatch({ name: `${fieldKey}_option` });

  const title = getFieldTitle(schema, fieldKey);
  const description = formatDescription(schema);

  const handleOptionChange = useCallback(
    (e, option) => {
      setValue(`${fieldKey}_option`, option, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
    },
    [setValue, fieldKey],
  );

  const handleToggleCollapse = useCallback(
    (e) => {
      e.stopPropagation();
      if (toggleCollapse) {
        toggleCollapse();
      }
    },
    [toggleCollapse],
  );

  const isCollapsable = useMemo(
    () => !!canBeCollapsed && !!toggleCollapse,
    [canBeCollapsed, toggleCollapse],
  );

  return (
    <div
      className={cn(
        'flex items-center gap-2 w-full group',
        isCollapsable && 'cursor-pointer'
      )}
      onClick={handleToggleCollapse}
    >
      {isCollapsable && (
        <Tooltip
          title={`${!isCollapsed ? 'Collapse' : 'Expand'} object`}
          arrow
        >
          <Iconify
            className="opacity-70 group-hover:opacity-100 transition-opacity min-w-[20px] w-4 h-4"
            icon={`mdi:chevron-${!isCollapsed ? 'up' : 'down'}`}
            width={16}
            onClick={handleToggleCollapse}
          />
        </Tooltip>
      )}
      
      {schema['x-icon'] && <IconRenderer icon={schema['x-icon']} />}
      
      {enableAIFill && (
        <AIToggle 
            value={optionValue ?? 'fill'}
          onChange={handleOptionChange}
                />
      )}
      
      {showSchemaType && (
        <Badge variant="outline" className="h-3.5 text-[9px] px-1.5">
          {schema.type}
        </Badge>
      )}
      
      <div className="flex items-center gap-1.5 w-full">
        <Tooltip
          title={<span className="text-xs">{description}</span>}
          arrow
          followCursor
          placement="top"
        >
          {title && (
            <p
              className="text-sm text-foreground"
              onClick={handleToggleCollapse}
            >
              {title}
            </p>
          )}
        </Tooltip>
        
        {required && <ValidationBadge isValid={requiredValid} />}
        
        {isArrayElement && dragRef && !expanded && (
          <Iconify
            ref={dragRef}
            icon="system-uicons:drag"
            {...(dragListeners || {})}
            className={cn(
              'w-4 h-4',
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            )}
          />
        )}
        
        {isArrayElement && onDeleteArrayElement && (
          <Iconify
            icon="mdi:delete"
            onClick={onDeleteArrayElement}
            className="text-destructive w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity"
          />
        )}
      </div>
      
      {isCollapsable && sneakPeek && (
        <div className="w-full relative" onClick={handleToggleCollapse}>
          <p className="group-hover:opacity-80 text-xs transition-opacity opacity-25 text-muted-foreground">
            {sneakPeek}
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(DynamicFormFieldHeader);
