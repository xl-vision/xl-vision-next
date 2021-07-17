import React from 'react';
import { LocalizationProvider as XlLocalizationProvider } from '@xl-vision/react';
import { env } from '@xl-vision/utils';
import PropTypes from 'prop-types';
import warning from '@xl-vision/react/utils/warning';
import locales, { Locale } from './locales';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
};

export type LocalizationContextProps = {
  language: string;
  setLanguage: (lang: string) => void;
  supportLocales: Record<string, Locale>;
  locale: Locale;
};

const defaultLanguage = 'en-US';

export const LocalizationContext = React.createContext<LocalizationContextProps>({
  language: defaultLanguage,
  setLanguage: () => {},
  supportLocales: locales,
  locale: locales[defaultLanguage],
});

const KEY = 'lang';

const langs = Object.keys(locales);

const LocalizationProvider: React.FunctionComponent<LocalizationProviderProps> = (props) => {
  const { children } = props;

  const [language, setLanguage] = React.useState<string>(() => {
    let lang: string | null | undefined = localStorage.getItem(KEY);
    if (lang) {
      return lang;
    }

    lang = navigator.language;

    if (langs.indexOf(lang) > -1) {
      return lang;
    }

    const prefix = lang.split('-')[0];

    lang = langs.find((it) => it.startsWith(prefix));

    if (lang) {
      return lang;
    }

    return defaultLanguage;
  });

  const setLanguageWrapper = React.useCallback((lang: string) => {
    localStorage.setItem(KEY, lang);
    setLanguage(lang);
  }, []);

  const locale = React.useMemo(() => {
    if (locales[language]) {
      return locales[language];
    }
    warning(
      true,
      `The specified lang '%s' has no corresponding locale configuration, please provide the corresponding locale file, otherwise the default language (en-US) will be used`,
      language,
    );
    return locales[defaultLanguage];
  }, [language]);

  return (
    <LocalizationContext.Provider
      value={{ language, setLanguage: setLanguageWrapper, supportLocales: locales, locale }}
    >
      <XlLocalizationProvider language={language}>{children}</XlLocalizationProvider>
    </LocalizationContext.Provider>
  );
};

if (env.isDevelopment) {
  LocalizationProvider.displayName = 'LocalizationProvider';
  LocalizationProvider.propTypes = {
    children: PropTypes.node,
  };
}

export default LocalizationProvider;
