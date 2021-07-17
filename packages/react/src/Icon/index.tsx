import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { env } from '@xl-vision/utils';
import { styled } from '../styles';
import BaseIcon, { BaseIconProps } from './BaseIcon';
import ThemeContext from '../ThemeProvider/ThemeContext';

export interface IconProps extends BaseIconProps {}

const IconRoot = styled(BaseIcon, {
  name: 'Icon',
  slot: 'Root',
})(({ theme }) => {
  const { transition } = theme;
  return {
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: 'currentcolor',
    flexShrink: 0,
    transition: transition.standard('fill', transition.durations.standard),
  };
});

const Icon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const { className, ...others } = props;

  const { clsPrefix } = React.useContext(ThemeContext);

  const rootClassName = `${clsPrefix}-icon`;

  const rootClasses = clsx(rootClassName, className);

  return <IconRoot {...others} className={rootClasses} ref={ref} />;
});

if (env.isDevelopment) {
  Icon.displayName = 'Icon';

  Icon.propTypes = {
    viewBox: PropTypes.string,
    className: PropTypes.string,
  };
}

export default Icon;
