import ListIcon from '@mui/icons-material/List';
import { Chip } from '@mui/material';

class SelectOptionRenderer {
  init(props) {
    this.eGui = document.createElement('div');
    this.eGui.className = 'flex items-center gap-2';
    this.eGui.style.height = '100%';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.padding = '0 4px';

    const option = props.options?.find((opt) => opt.label === props.value);

    if (option) {
      const colorDot = document.createElement('div');
      colorDot.style.backgroundColor = option.color;
      colorDot.style.width = '12px';
      colorDot.style.height = '12px';
      colorDot.style.borderRadius = '50%';
      colorDot.style.flexShrink = '0';
      colorDot.style.marginRight = '4px';
      this.eGui.appendChild(colorDot);

      const label = document.createElement('span');
      label.textContent = option.label;
      this.eGui.appendChild(label);
    } else {
      const label = document.createElement('span');
      label.textContent = props.value || 'Select options...';
      label.style.opacity = props.value ? '1' : '0.7';
      this.eGui.appendChild(label);
    }
  }

  getGui() {
    return this.eGui;
  }
}

export const getSelectColumnDef = ({ field, getCommonFieldMenuItems }) => {
  const isMultiSelect = field.type === 'multiSelect';
  const selectOptions = field.options?.select_options || [];

  return {
    field: field.name.toLowerCase(),
    headerName: field.name,
    editable: true,
    cellEditor: 'agRichSelectCellEditor',
    cellEditorParams: {
      values: selectOptions.map((opt) => opt.label),
      cellRenderer: SelectOptionRenderer,
      cellRendererParams: {
        options: selectOptions,
      },
      searchType: isMultiSelect ? 'matchAny' : 'match',
      multiSelect: isMultiSelect,
      allowTyping: true,
      filterList: true,
      highlightMatch: true,
      onKeyDown: (event) => {
        if (event.key === 'Enter' && isMultiSelect) {
          event.stopPropagation();
          return false;
        }
      },
    },
    valueFormatter: (params) => {
      if (!params.value) return '';
      if (isMultiSelect) {
        return Array.isArray(params.value) ? params.value.join(',') : params.value;
      }
      return params.value;
    },
    valueParser: (params) => {
      if (isMultiSelect) {
        return Array.isArray(params.newValue)
          ? params.newValue
          : params.newValue.split(',').filter(Boolean);
      }
      return params.newValue;
    },
    headerComponent: (params) => (
      <div className="flex items-center gap-2">
        <ListIcon
          fontSize="small"
          sx={{ opacity: 0.7 }}
        />
        <span>{params.displayName}</span>
      </div>
    ),
    cellRenderer: (params) => {
      if (!params.value) return '';
      const values = isMultiSelect
        ? Array.isArray(params.value)
          ? params.value
          : params.value.split(',').filter(Boolean)
        : [params.value];

      return (
        <div className="flex items-center h-full">
          <div className="flex flex-wrap gap-1">
            {values.map((value) => {
              const option = selectOptions.find((opt) => opt.label === value);
              if (!option) return null;
              return (
                <Chip
                  key={value}
                  label={value}
                  size="small"
                  style={{
                    backgroundColor: option.color,
                    color: option.textColor || '#fff',
                  }}
                />
              );
            })}
          </div>
        </div>
      );
    },
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: true,
    mainMenuItems: (params) => getCommonFieldMenuItems(field, params),
  };
};
