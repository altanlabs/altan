// PostgreSQL native types organized by category
import { Code } from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DataObjectIcon from '@mui/icons-material/DataObject';
import NumbersIcon from '@mui/icons-material/Numbers';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TimerIcon from '@mui/icons-material/Timer';

export const POSTGRES_TYPES = [
  // Text Types
  {
    category: 'Text',
    name: 'Text',
    type: 'text',
    description: 'Variable unlimited length text',
    icon: TextFieldsIcon,
  },
  {
    category: 'Text',
    name: 'VARCHAR',
    type: 'varchar',
    description: 'Variable length with limit (e.g., varchar(255))',
    icon: TextFieldsIcon,
  },
  {
    category: 'Text',
    name: 'CHAR',
    type: 'char',
    description: 'Fixed length text',
    icon: TextFieldsIcon,
  },

  // Numeric Types
  {
    category: 'Numeric',
    name: 'Integer',
    type: 'integer',
    description: 'Whole numbers from -2.1B to 2.1B',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Big Integer',
    type: 'bigint',
    description: 'Large whole numbers',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Small Integer',
    type: 'smallint',
    description: 'Small whole numbers (-32,768 to 32,767)',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Serial',
    type: 'serial',
    description: 'Auto-incrementing integer',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Big Serial',
    type: 'bigserial',
    description: 'Auto-incrementing big integer',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Decimal',
    type: 'numeric',
    description: 'Exact decimal numbers (e.g., money)',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Real',
    type: 'real',
    description: 'Floating point (6 decimal digits)',
    icon: NumbersIcon,
  },
  {
    category: 'Numeric',
    name: 'Double Precision',
    type: 'double precision',
    description: 'Floating point (15 decimal digits)',
    icon: NumbersIcon,
  },

  // Boolean
  {
    category: 'Boolean',
    name: 'Boolean',
    type: 'boolean',
    description: 'True or False',
    icon: CheckBoxIcon,
  },

  // Date/Time Types
  {
    category: 'Date & Time',
    name: 'Timestamp',
    type: 'timestamp',
    description: 'Date and time (no timezone)',
    icon: CalendarTodayIcon,
  },
  {
    category: 'Date & Time',
    name: 'Timestamp with Timezone',
    type: 'timestamptz',
    description: 'Date and time with timezone',
    icon: CalendarTodayIcon,
  },
  {
    category: 'Date & Time',
    name: 'Date',
    type: 'date',
    description: 'Date only (no time)',
    icon: CalendarTodayIcon,
  },
  {
    category: 'Date & Time',
    name: 'Time',
    type: 'time',
    description: 'Time only (no date)',
    icon: TimerIcon,
  },
  {
    category: 'Date & Time',
    name: 'Interval',
    type: 'interval',
    description: 'Time duration',
    icon: TimerIcon,
  },

  // JSON Types
  {
    category: 'JSON',
    name: 'JSON',
    type: 'json',
    description: 'JSON data (text storage)',
    icon: Code,
  },
  {
    category: 'JSON',
    name: 'JSONB',
    type: 'jsonb',
    description: 'JSON data (binary, faster)',
    icon: Code,
  },

  // UUID
  {
    category: 'UUID',
    name: 'UUID',
    type: 'uuid',
    description: 'Universally unique identifier',
    icon: DataObjectIcon,
  },

  // Array Types
  {
    category: 'Array',
    name: 'Text Array',
    type: 'text[]',
    description: 'Array of text values',
    icon: DataObjectIcon,
  },
  {
    category: 'Array',
    name: 'Integer Array',
    type: 'integer[]',
    description: 'Array of integers',
    icon: DataObjectIcon,
  },

  // Binary
  {
    category: 'Binary',
    name: 'Bytea',
    type: 'bytea',
    description: 'Binary data',
    icon: DataObjectIcon,
  },
];
