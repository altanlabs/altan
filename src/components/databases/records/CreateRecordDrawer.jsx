import { X } from 'lucide-react';
import { useState, useCallback, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createRecord, selectTableById } from '../../../redux/slices/cloud';
import { dispatch } from '../../../redux/store';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../ui/sheet';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';

const CreateRecordDrawer = ({ baseId, tableId, open, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const table = useSelector(
    useMemo(
      () => (state) => selectTableById(state, baseId, tableId),
      [baseId, tableId],
    ),
  );

  const fields = useMemo(() => table?.fields?.items || [], [table]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleClose = useCallback(() => {
    setFormData({});
    onClose?.();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!baseId || !tableId) return;

    setIsSubmitting(true);
    try {
      // Filter out empty values and system fields
      const recordData = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value !== '' && value !== null && value !== undefined &&
            !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(key)) {
          recordData[key] = value;
        }
      });

      if (Object.keys(recordData).length > 0) {
        await dispatch(createRecord(baseId, tableId, recordData));
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [baseId, tableId, formData, handleClose]);

  const renderFieldInput = useCallback((field) => {
    const value = formData[field.name] ?? formData[field.db_field_name] ?? '';
    const fieldName = field.db_field_name || field.name;
    const dataType = field.data_type?.toLowerCase() || 'text';

    // Determine input type based on PostgreSQL data type
    let inputType = 'text';
    let isTextarea = false;

    if (dataType === 'boolean') {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={fieldName}>
            {field.name}
            {!field.is_nullable && <span className="text-destructive"> *</span>}
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldName}
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(fieldName, checked)}
            />
            <Label htmlFor={fieldName} className="text-sm text-muted-foreground">
              {value ? 'True' : 'False'}
            </Label>
          </div>
          {field.comment && <p className="text-xs text-muted-foreground">{field.comment}</p>}
        </div>
      );
    }

    if (dataType.includes('int') || dataType === 'numeric' || dataType === 'real' || dataType === 'double precision') {
      inputType = 'number';
    } else if (dataType === 'date') {
      inputType = 'date';
    } else if (dataType === 'time') {
      inputType = 'time';
    } else if (dataType.includes('timestamp')) {
      inputType = 'datetime-local';
    } else if (dataType === 'text' || dataType.includes('json')) {
      isTextarea = true;
    }

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={fieldName}>
          {field.name}
          {!field.is_nullable && <span className="text-destructive"> *</span>}
        </Label>
        {isTextarea ? (
          <Textarea
            id={fieldName}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            rows={3}
            required={!field.is_nullable}
          />
        ) : (
          <Input
            id={fieldName}
            type={inputType}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            required={!field.is_nullable}
          />
        )}
        {field.comment && <p className="text-xs text-muted-foreground">{field.comment}</p>}
        {!field.comment && <p className="text-xs text-muted-foreground">Type: {field.data_type}</p>}
      </div>
    );
  }, [formData, handleFieldChange]);

  if (!tableId || !baseId) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[500px] sm:max-w-[500px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Create {table?.name || 'Record'}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {fields
              .filter((field) => !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(field.db_field_name || field.name))
              .map((field) => renderFieldInput(field))}

            {fields.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No fields available. Add fields to this table first.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-background/50 flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(formData).length === 0 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Creating...' : 'Create Record'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default memo(CreateRecordDrawer);
