import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      fr: { translation: fr },
    },
    // lng: Localization.locale.startsWith('en') ? 'en' : 'fr',
    // fallbackLng: 'fr',
    // interpolation: {
    //   escapeValue: false,    },
    lng: 'en', 
    fallbackLng: 'en',
    interpolation: { escapeValue: false }

  });

export default i18n;
