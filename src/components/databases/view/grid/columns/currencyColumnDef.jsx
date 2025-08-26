import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { getDefaultColumnDef } from './defaultColumnDef.jsx';

export const getCurrencyColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  ...getDefaultColumnDef({
    field,
    getCommonFieldMenuItems,
    cellEditor: 'agNumberCellEditor',
    additionalProps: {
      cellEditorParams: {
        min: 0,
        precision: 2,
      },
      valueFormatter: (params) => {
        const value = params.value;
        if (value === null || value === undefined || value === '') return '';
        
        // Format as currency
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Number(value));
      },
      valueParser: (params) => {
        // Remove currency symbols and parse as number
        const cleanValue = params.newValue?.toString().replace(/[$,]/g, '');
        return cleanValue ? Number(cleanValue) : null;
      },
      headerComponent: (params) => (
        <div className="flex items-center gap-2">
          <AttachMoneyIcon
            fontSize="small"
            sx={{ opacity: 0.7 }}
          />
          <span>{params.displayName}</span>
        </div>
      ),
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '12px',
        fontWeight: '500',
        color: '#059669', // Green color for currency
      },
    },
  }),
});
