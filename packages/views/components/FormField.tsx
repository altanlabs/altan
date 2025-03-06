import React from "react";
import { FieldType, TableField, fieldHelpers } from "@altanlabs/database";

interface FormFieldProps {
  field: TableField;
  value: unknown;
  onChange: (value: unknown) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const getInputType = () => {
    switch (field.type) {
      case FieldType.Email:
        return "email";
      case FieldType.Date:
      case FieldType.DateTime:
        return "datetime-local";
      case FieldType.Number:
      case FieldType.Currency:
      case FieldType.Percent:
        return "number";
      case FieldType.Checkbox:
        return "checkbox";
      case FieldType.URL:
        return "url";
      case FieldType.Phone:
        return "tel";
      default:
        return "text";
    }
  };

  if (
    field.type === FieldType.SingleSelect ||
    field.type === FieldType.MultiSelect
  ) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {field.name}{" "}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="w-full p-2 border rounded"
          multiple={field.type === FieldType.MultiSelect}
        >
          {field.options?.map((option) => (
            <option
              key={typeof option === "string" ? option : option.value}
              value={typeof option === "string" ? option : option.value}
            >
              {typeof option === "string" ? option : option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {field.name} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={getInputType()}
        value={fieldHelpers.formatFieldValue(value, field) || ""}
        onChange={(e) => {
          let newValue = e.target.value;
          if (
            field.type === FieldType.Number ||
            field.type === FieldType.Currency
          ) {
            newValue = parseFloat(newValue);
          }
          onChange(newValue);
        }}
        required={field.required}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        readOnly={field.readonly}
        className="w-full p-2 border rounded"
      />
    </div>
  );
};
