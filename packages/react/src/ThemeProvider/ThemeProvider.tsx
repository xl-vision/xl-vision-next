import { ThemeContext as StyledThemeContext } from '@xl-vision/styled-engine';
import PropTypes from 'prop-types';
import React from 'react';
import { env } from '@xl-vision/utils';
import createTheme, { BaseTheme } from './createTheme';
import ThemeContext from './ThemeContext';

export type ThemeProviderProps = {
  children: React.ReactNode;
  theme: BaseTheme;
};

const ThemeProvider: React.FunctionComponent<ThemeProviderProps> = (props) => {
  const { children, theme } = props;

  const value = React.useMemo(() => {
    return createTheme(theme);
  }, [theme]);

  return (
    // both self ThemeContext and styled-engine ThemeContext
    <ThemeContext.Provider value={value}>
      <StyledThemeContext.Provider value={value}>{children}</StyledThemeContext.Provider>
    </ThemeContext.Provider>
  );
};

if (env.isDevelopment) {
  ThemeProvider.displayName = 'ThemeProvider';

  ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
    theme: PropTypes.object.isRequired,
  };
}

export default ThemeProvider;
