import React from 'react';
import { Button, styled, Icon, Tooltip, Dropdown } from '@xl-vision/react';
import { DownOutlined, GithubFilled } from '@xl-vision/icons';
import { darken, lighten } from '@xl-vision/react/utils/color';
import { NavLink } from 'react-router-dom';
import LightTheme from './LightTheme';
import DarkTheme from './DarkTheme';
import Translate from './Translate';
import { ThemeContext } from '../ThemeProvider';
import { LocalizationContext } from '../LocalizationProvider';

const Container = styled('div')(() => {
  return {
    width: '100%',
    height: '60px',
  };
});

const HeaderNav = styled('header')<{ isDark: boolean }>(({ theme, styleProps }) => {
  const { isDark } = styleProps;

  const { color } = theme;

  const background = (isDark ? darken : lighten)(color.background.paper, 0.1);

  const fontColor = color.getContrastText(background).text.primary;

  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: '60px',
    // borderBottom: `1px solid ${theme.color.divider}`,
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: '0 16px',
    background,
    color: fontColor,
    justifyContent: 'space-between',
    ...theme.elevations(4),

    '.xl-button__root': {
      color: fontColor,
    },
  };
});

const Logo = styled(NavLink)(({ theme }) => {
  return {
    display: 'inline-block',
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.color.themes.primary.color,
    textDecoration: 'none',
  };
});

const Menus = styled('ul')(({ theme }) => {
  return {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    li: {
      a: {
        display: 'block',
        color: theme.color.text.primary,
        fontWeight: theme.typography.fontWeight.medium,
        textDecoration: 'none',
        padding: '6px 12px',
        transition: theme.transition.standard('all'),
        '&.active, &:hover': {
          color: theme.color.themes.primary.color,
        },
      },
    },
  };
});

const Header = () => {
  const theme = React.useContext(ThemeContext);
  const { supportLocales, locale, setLanguage } = React.useContext(LocalizationContext);

  const { isDark, setDark } = theme;

  const handleTheme = React.useCallback(() => {
    setDark((prev) => !prev);
  }, [setDark]);

  const langs = React.useMemo(() => Object.keys(supportLocales), [supportLocales]);

  return (
    <Container>
      <HeaderNav styleProps={{ isDark }}>
        <Logo exact={true} to='/'>
          XL-VISION
        </Logo>
        <Menus>
          <li>
            <NavLink to='/components'>{locale.header.component}</NavLink>
          </li>
          <li>
            <NavLink to='/editor'>{locale.header.editor}</NavLink>
          </li>
        </Menus>
        <div>
          <Dropdown
            menus={
              <>
                {langs.map((lang) => (
                  <Dropdown.Item onClick={() => setLanguage(lang)} key={lang}>
                    {supportLocales[lang].name}
                  </Dropdown.Item>
                ))}
              </>
            }
          >
            <span>
              <Button
                aria-label='Language'
                variant='text'
                prefixIcon={
                  <Icon>
                    <Translate />
                  </Icon>
                }
                suffixIcon={
                  <Icon>
                    <DownOutlined />
                  </Icon>
                }
              >
                {locale.name}
              </Button>
            </span>
          </Dropdown>
          <Tooltip content={locale.header.themeTooltip} placement='bottom' showDelay={1500}>
            <Button
              aria-label='Theme'
              variant='text'
              onClick={handleTheme}
              prefixIcon={<Icon>{isDark ? <LightTheme /> : <DarkTheme />}</Icon>}
            />
          </Tooltip>
          <Tooltip content={locale.header.githubTooltip} placement='bottom' showDelay={1500}>
            <Button
              aria-label='Github'
              variant='text'
              target='_black'
              href='https://github.com/xl-vision/xl-vision'
              prefixIcon={
                <Icon>
                  <GithubFilled />
                </Icon>
              }
            />
          </Tooltip>
        </div>
      </HeaderNav>
    </Container>
  );
};

export default Header;
