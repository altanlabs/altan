// @mui
import { enUS, frFR, zhCN, viVN, arSA, esES, deDE, ruRU } from '@mui/material/locale';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: 'emojione:flag-for-flag-united-states',
  },
  {
    label: 'Spanish',
    value: 'es',
    systemValue: esES,
    icon: 'emojione:flag-for-flag-spain',
  },
  {
    label: 'German',
    value: 'de',
    systemValue: deDE,
    icon: 'emojione:flag-for-flag-germany',
  },
  {
    label: 'French',
    value: 'fr',
    systemValue: frFR,
    icon: 'emojione:flag-for-flag-france',
  },
  {
    label: 'Vietnamese',
    value: 'vi',
    systemValue: viVN,
    icon: 'emojione:flag-for-flag-vietnam',
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: zhCN,
    icon: 'emojione:flag-for-flag-china',
  },
  {
    label: 'Arabic (Sudan)',
    value: 'ar',
    systemValue: arSA,
    icon: 'emojione:flag-for-flag-saudi-arabia',
  },
  {
    label: 'Russian',
    value: 'ru',
    systemValue: ruRU,
    icon: 'emojione:flag-for-flag-russia',
  },
];

export const defaultLang = allLangs[0]; // English
