
export const getNewColumnDef = ({ setShowFieldDialog }) => ({
  field: 'new',
  headerName: '',
  width: 50,
  minWidth: 50,
  maxWidth: 50,
  resizable: false,
  sortable: false,
  filter: false,
  pinned: 'right',
  headerComponent: () => (
    <div
      className="flex items-center justify-center h-full cursor-pointer"
      onClick={() => setShowFieldDialog(true)}
    >
      <span className="text-xl">+</span>
    </div>
  ),
});
