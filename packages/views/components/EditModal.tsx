import { useForm } from "react-hook-form";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableRecordItem, TableSchema, FieldType } from "@altanlabs/database";

type Fields = Record<string, unknown>;

interface EditModalProps {
  record: TableRecordItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Fields) => void;
  schema: TableSchema | null;
}

// System fields that should not be included in create/edit operations
const SYSTEM_FIELDS = [
  "id",
  "created_time",
  "last_modified_time",
  "last_modified_by",
  "created_at",
];

export function EditModal({
  record,
  isOpen,
  onClose,
  onSave,
  schema,
}: EditModalProps) {
  const form = useForm<Fields>({
    defaultValues: record ? filterSystemFields(record) : {},
  });

  // Filter out system fields from the record
  function filterSystemFields(record: TableRecordItem): Fields {
    const filteredRecord: Fields = {};
    Object.entries(record).forEach(([key, value]) => {
      if (!SYSTEM_FIELDS.includes(key)) {
        filteredRecord[key] = value;
      }
    });
    return filteredRecord;
  }

  useEffect(() => {
    if (record) {
      form.reset(filterSystemFields(record));
    } else {
      form.reset({}); // Reset form when creating new record
    }
  }, [record, form]);

  function onSubmit(data: Fields) {
    // Ensure we're not sending any system fields
    const cleanedData = filterSystemFields(data);
    onSave(cleanedData);
    onClose();
  }

  if (!schema?.fields?.items) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Record" : "Create Record"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {schema.fields.items
              .filter(
                (field) =>
                  field &&
                  field.db_field_name &&
                  !SYSTEM_FIELDS.includes(field.db_field_name)
              )
              .map((field) => (
                <FormField
                  key={field.id || field.name}
                  control={form.control}
                  name={field.db_field_name}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.name}</FormLabel>
                      <FormControl>
                        <Input
                          type={
                            field.type === FieldType.Date
                              ? "date"
                              : field.type === FieldType.Checkbox
                              ? "checkbox"
                              : field.type === FieldType.Number
                              ? "number"
                              : "text"
                          }
                          {...formField}
                          value={
                            formField.value === undefined
                              ? ""
                              : String(formField.value)
                          }
                          checked={
                            field.type === FieldType.Checkbox
                              ? Boolean(formField.value)
                              : undefined
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
