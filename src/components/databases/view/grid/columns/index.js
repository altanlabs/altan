import { getAttachmentColumnDef } from './attachmentColumnDef';
import { getCheckboxColumnDef } from './checkboxColumnDef.jsx';
import { getCreatedAtColumnDef } from './createdAtColumnDef.jsx';
import { getCreatedByColumnDef } from './createdByColumnDef.jsx';
import { getCurrencyColumnDef } from './currencyColumnDef.jsx';
import { getDefaultColumnDef } from './defaultColumnDef.jsx';
import { getIdColumnDef } from './idColumnDef.jsx';
import { getJsonColumnDef } from './jsonColumnDef.jsx';
import { getLongTextColumnDef } from './longTextColumnDef.jsx';
import { getNewColumnDef } from './newColumnDef.jsx';
import { getRatingColumnDef } from './ratingColumnDef.jsx';
import { getReferenceColumnDef } from './referenceColumnDef.jsx';
import { getSelectColumnDef } from './selectColumnDef.jsx';
import { getTriggerColumnDef } from './triggerColumnDef.jsx';
import { getUpdatedAtColumnDef } from './updatedAtColumnDef.jsx';
import { getUpdatedByColumnDef } from './updatedByColumnDef.jsx';
import { getUrlColumnDef } from './urlColumnDef.jsx';
import { getUserColumnDef } from './userColumnDef.jsx';
import { FIELD_TYPES } from '../../../fields/utils/fieldTypes';

export const createColumnDefs = ({
  fields,
  table,
  members,
  handleExpandRecord,
  setShowFieldDialog,
  getCommonFieldMenuItems,
  onEditField,
  getAdditionalColumnProps,
}) => {
  const getFieldIcon = (fieldType) => {
    return FIELD_TYPES.find((type) => type.id === fieldType)?.icon;
  };

  return [
    getIdColumnDef({ handleExpandRecord }),
    ...fields.map((field) => {
      // Add the icon component and ensure we use db_field_name
      const fieldWithIcon = {
        ...field,
        icon: getFieldIcon(field.type),
        field: field.db_field_name,
        headerName: field.name,
      };

      // Get additional column props if provided
      const additionalProps = getAdditionalColumnProps ? getAdditionalColumnProps(field) : {};

      switch (field.type) {
        case 'trigger':
          return getTriggerColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'json':
          return getJsonColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'user':
          return getUserColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, members, onEditField, additionalProps });
        case 'checkbox':
          return getCheckboxColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'reference':
          return getReferenceColumnDef({ field: fieldWithIcon, table, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'singleSelect':
        case 'multiSelect':
          return getSelectColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'longText':
          return getLongTextColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'rating':
          return getRatingColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'date':
          return getDefaultColumnDef({
            field: fieldWithIcon,
            getCommonFieldMenuItems,
            onEditField,
            cellEditor: 'agDateCellEditor',
            additionalProps,
          });
        case 'url':
          return getUrlColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'attachment':
          return getAttachmentColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        case 'currency':
          return getCurrencyColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
        default:
          return getDefaultColumnDef({ field: fieldWithIcon, getCommonFieldMenuItems, onEditField, additionalProps });
      }
    }),
    // Add system columns at the end before the "New Column" definition
    getCreatedAtColumnDef(),
    getUpdatedAtColumnDef(),
    getCreatedByColumnDef({ table, members }),
    getUpdatedByColumnDef({ table, members }),
    getNewColumnDef({ setShowFieldDialog }),
  ];
};
