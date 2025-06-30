const OnDeleteMode = {
  CASCADE: 'CASCADE',
  RESTRICT: 'RESTRICT',
  SET_NULL: 'SET NULL',
  NO_ACTION: 'NO ACTION',
  SET_DEFAULT: 'SET DEFAULT',
};

const getDefaultConfig = (type) => {
  switch (type) {
    case 'checkbox':
      return {
        checkbox_options: {
          icon: 'mdi:check',
          color: '#22C55E',
        },
      };
    case 'reference':
      return {
        reference_options: {
          foreign_table: null,
          on_delete_mode: OnDeleteMode.RESTRICT,
        },
      };
    case 'multiSelect':
    case 'singleSelect':
    case 'select':
      return {
        select_options: [],
      };
    case 'number':
      return {
        decimals: 0,
        allowNegative: true,
      };
    case 'date':
    case 'dateTime':
      return {
        datetime_options: {
          include_time: type === 'dateTime',
          display_time_zone: false,
          date_format: 'Local',
          time_format: '12 hour',
          time_zone: 'GMT/UTC',
        },
      };
    case 'rating':
      return {
        rating_options: {
          icon: 'mdi:star',
          color: '#EAB308',
          max_value: 5,
        },
      };
    case 'user':
      return {
        user_options: {
          allow_multiple: false,
          notify_users: false,
        },
      };
    case 'attachment':
      return {
        attachment_options: {
          allowed_types: [],
          max_size: 5242880,
          max_files: 10,
        },
      };
    default:
      return {
        required: false,
      };
  }
};

export default getDefaultConfig;
