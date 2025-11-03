import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// utils
import { defaultLang } from './config-lang';
import localStorageAvailable from '../utils/localStorageAvailable';
//
//
import arLocales from './langs/ar';
import cnLocales from './langs/cn';
import deLocales from './langs/de';
import enLocales from './langs/en';
import esLocales from './langs/es';
import frLocales from './langs/fr';
import ruLocales from './langs/ru';
import viLocales from './langs/vi';

// ----------------------------------------------------------------------

let lng = defaultLang.value;

const storageAvailable = localStorageAvailable();

if (storageAvailable) {
  lng = localStorage.getItem('i18nextLng') || defaultLang.value;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: enLocales },
      fr: { translations: frLocales },
      vi: { translations: viLocales },
      cn: { translations: cnLocales },
      ar: { translations: arLocales },
      es: { translations: esLocales },
      de: { translations: deLocales },
      ru: { translations: ruLocales },
    },
    lng,
    fallbackLng: defaultLang.value,
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
