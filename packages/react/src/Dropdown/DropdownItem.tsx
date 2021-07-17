import { CSSObject } from '@xl-vision/styled-engine-types';
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { env } from '@xl-vision/utils';
import BaseButton from '../BaseButton';
import useEventCallback from '../hooks/useEventCallback';
import { styled } from '../styles';
import DropdownContext from './DropdownContext';
import ThemeContext from '../ThemeProvider/ThemeContext';

export interface DropdownItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

const displayName = 'DropdownItem';

const DropdownItemRoot = styled('li', {
  name: displayName,
  slot: 'Root',
})(() => {
  return {
    display: 'block',
    padding: 0,
    margin: 0,
  };
});

export type DropdownItemButtonStyleProps = {
  disabled?: boolean;
};

const DropdownItemButton = styled(BaseButton, {
  name: displayName,
  slot: 'Button',
})<DropdownItemButtonStyleProps>(({ theme, styleProps }) => {
  const { color, transition, typography } = theme;

  const { disabled } = styleProps;

  const styles: CSSObject = {
    padding: '5px 12px',
    transition: transition.standard('all'),
    color: color.text.primary,
    // 不设置会导致有间隙，原因未知
    width: '100%',
    textAlign: 'left',
    ...typography.body2,
  };

  if (disabled) {
    styles.opacity = color.action.disabled;
  } else {
    styles[':hover'] = {
      backgroundColor: color.themes.primary.color,
      color: color.themes.primary.text.primary,
    };
  }

  return styles;
});

const DropdownItem = React.forwardRef<HTMLLIElement, DropdownItemProps>((props, ref) => {
  const { children, onClick, disabled, className, ...others } = props;

  const { clsPrefix } = React.useContext(ThemeContext);

  const { setVisible } = React.useContext(DropdownContext);

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLLIElement>) => {
    if (disabled) {
      return;
    }
    setVisible(false);
    onClick?.(e);
  });

  const rootClassName = `${clsPrefix}-dropdown-item`;

  const rootClasses = clsx(
    rootClassName,
    {
      [`${rootClassName}--disabled`]: disabled,
    },
    className,
  );

  return (
    <DropdownItemRoot {...others} ref={ref} onClick={handleClick} className={rootClasses}>
      <DropdownItemButton
        styleProps={{ disabled }}
        // cant use prop disabled
        // see https://github.com/facebook/react/issues/10109
        // disabled={disabled}
        aria-disabled={disabled}
        disableRipple={disabled}
        className={`${rootClassName}__button`}
      >
        {children}
      </DropdownItemButton>
    </DropdownItemRoot>
  );
});

if (env.isDevelopment) {
  DropdownItem.displayName = displayName;
  DropdownItem.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
  };
}

export default DropdownItem;
