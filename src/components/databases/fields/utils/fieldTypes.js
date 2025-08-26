// src/components/databases/fields/fieldTypes.js
import { Code } from '@mui/icons-material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import ListIcon from '@mui/icons-material/List';
import NotesIcon from '@mui/icons-material/Notes';
import NumbersIcon from '@mui/icons-material/Numbers';
import PhoneIcon from '@mui/icons-material/Phone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import TextFieldsIcon from '@mui/icons-material/TextFields';

export const FIELD_TYPES = [
  { id: 'reference', name: 'Link to another record', icon: LinkIcon },
  { id: 'singleLineText', name: 'Single line text', icon: TextFieldsIcon },
  { id: 'longText', name: 'Long text', icon: NotesIcon },
  { id: 'number', name: 'Numeric', icon: NumbersIcon },
  { id: 'singleSelect', name: 'Single select', icon: ListIcon },
  { id: 'multiSelect', name: 'Multiple select', icon: ListIcon },
  { id: 'date', name: 'Date', icon: CalendarTodayIcon },
  { id: 'checkbox', name: 'Checkbox', icon: CheckBoxIcon },
  { id: 'rating', name: 'Rating', icon: StarIcon },
  { id: 'attachment', name: 'Attachment', icon: AttachFileIcon },
  { id: 'email', name: 'Email', icon: EmailIcon },
  { id: 'phone', name: 'Phone', icon: PhoneIcon },
  { id: 'url', name: 'URL', icon: LinkIcon },
  { id: 'json', name: 'JSON', icon: Code },
  { id: 'trigger', name: 'Trigger', icon: PlayArrowIcon },
  { id: 'currency', name: 'Currency', icon: AttachMoneyIcon },
  // { id: 'duration', name: 'Duration', icon: TimerIcon },
  // { id: 'formula', name: 'Formula', icon: FunctionsIcon },
  // { id: 'rollup', name: 'Rollup', icon: SummarizeIcon },
  // { id: 'lookup', name: 'Lookup', icon: Search },
  // { id: 'count', name: 'Count', icon: NumbersIcon },
  // { id: 'percent', name: 'Percent', icon: PercentIcon },
];
