export const DataTable: React.FC<DataTableProps> = ({
  records,
  schema,
  onEdit,
  onDelete,
}) => {
  console.log("DataTable props:", { records, schema });

  if (!schema?.fields?.items) {
    console.log("Schema structure:", schema);
    return <div>Waiting for schema...</div>;
  }

  const visibleFields = schema.fields.items.filter(
    (field) => field && field.name && !field.hidden
  );

  if (visibleFields.length === 0) {
    return <div>No visible fields found in schema</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {visibleFields.map((field) => (
            <TableHead key={field.id || field.name}>{field.name}</TableHead>
          ))}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            {visibleFields.map((field) => {
              // Use db_field_name instead of name to access the value
              const fieldValue = record[field.db_field_name];
              return (
                <TableCell key={field.id || field.name}>
                  {fieldHelpers.formatFieldValue(fieldValue, field)}
                </TableCell>
              );
            })}
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onEdit(record)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
