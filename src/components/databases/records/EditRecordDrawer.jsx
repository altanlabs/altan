import { X, Share2 } from 'lucide-react';
import { useState, useCallback, memo, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { updateRecordById, selectTableState, selectTableById } from '../../../redux/slices/cloud';
import { dispatch } from '../../../redux/store';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../ui/sheet';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';

const EditRecordDrawer = ({ baseId, tableId, recordId, open, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const table = useSelector(
    useMemo(
      () => (state) => selectTableById(state, baseId, tableId),
      [baseId, tableId],
    ),
  );

  const fields = useMemo(() => table?.fields?.items ?? [], [table]);

  const tableState = useSelector(
    useMemo(
      () => (state) => selectTableState(state, tableId),
      [tableId],
    ),
  );

  const record = useMemo(
    () => tableState?.records?.find((r) => r?.id === recordId) ?? null,
    [tableState, recordId],
  );

  // Initialize form data from record
  useEffect(() => {
    if (record && open) {
      setFormData(record);
      setIsDirty(false);
    }
  }, [record, open]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!baseId || !tableId || !recordId || !isDirty) return;

    setIsSubmitting(true);
    try {
      // Only send changed fields
      const changes = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== record[key] && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes[key] = formData[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        await dispatch(updateRecordById(baseId, tableId, recordId, changes));
        setIsDirty(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [baseId, tableId, recordId, formData, record, isDirty]);

  const handleShare = useCallback(() => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).catch(() => {});
  }, []);

  const handleClose = useCallback(() => {
    if (isDirty) {
      // eslint-disable-next-line no-alert
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setFormData({});
    setIsDirty(false);
    onClose?.();
  }, [isDirty, onClose]);

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
            rows={3}
            required={!field.is_nullable}
          />
        ) : (
          <Input
            id={fieldName}
            type={inputType}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            required={!field.is_nullable}
          />
        )}
        {field.comment && <p className="text-xs text-muted-foreground">{field.comment}</p>}
        {!field.comment && <p className="text-xs text-muted-foreground">Type: {field.data_type}</p>}
      </div>
    );
  }, [formData, handleFieldChange]);

  if (!tableId || !recordId || !baseId || recordId === null) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>{record?.name || table?.name || 'Edit Record'}</SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {fields
              .filter((field) => !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(field.db_field_name || field.name))
              .map((field) => renderFieldInput(field))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-background/50">
          <Button
            onClick={handleSubmit}
            disabled={!isDirty || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default memo(EditRecordDrawer);
