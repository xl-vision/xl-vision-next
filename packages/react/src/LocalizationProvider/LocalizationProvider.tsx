import React from 'react';
import PropTypes from 'prop-types';
import { env } from '@xl-vision/utils';
import { defaultLanguage, locales, Locales } from '../locale';
import warning from '../utils/warning';
import LocalizationContext from './LocalizationContext';

export type LocalizationProviderProps = {
  customLocales?: Locales;
  language: string;
  children: React.ReactNode;
};

const LocalizationProvider: React.FunctionComponent<LocalizationProviderProps> = (props) => {
  const { customLocales, language = defaultLanguage, children } = props;

  const memorizedValue = React.useMemo(() => {
    const locale = customLocales?.[language] || locales[language];

    if (!locale) {
      warning(
        true,
        `The specified lang '%s' has no corresponding locale configuration, please provide the corresponding locale file, otherwise the default language (en-US) will be used`,
        language,
      );
      return { locale: locales[defaultLanguage], language: defaultLanguage };
    }

    return { locale, language };
  }, [customLocales, language]);

  return (
    <LocalizationContext.Provider value={memorizedValue}>{children}</LocalizationContext.Provider>
  );
};

if (env.isDevelopment) {
  LocalizationProvider.displayName = 'LocalizationProvider';

  LocalizationProvider.propTypes = {
    customLocales: PropTypes.shape({}),
    language: PropTypes.string.isRequired,
    children: PropTypes.node,
  };
}

export default LocalizationProvider;
