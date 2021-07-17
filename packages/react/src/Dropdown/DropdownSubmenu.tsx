import { CSSObject } from '@xl-vision/styled-engine-types';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { RightOutlined } from '@xl-vision/icons';
import { env } from '@xl-vision/utils';
import BaseButton from '../BaseButton';
import useEventCallback from '../hooks/useEventCallback';
import usePropChange from '../hooks/usePropChange';
import Popper, { PopperPlacement, PopperProps, PopperTrigger } from '../Popper';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';
import DropdownContext from './DropdownContext';
import Icon from '../Icon';

export interface DropdownSubmenuProps
  extends Omit<
    PopperProps,
    'popup' | 'arrow' | 'transitionClasses' | 'disablePopupEnter' | 'children' | 'title'
  > {
  children: React.ReactNode;
  transitionClassName?: string;
  title: React.ReactNode;
  disabled?: boolean;
}

const displayName = 'DropdownSubmenu';

const DropdownSubmenuRoot = styled(Popper, {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { clsPrefix, transition } = theme;

  return {
    [`.${clsPrefix}-dropdown-submenu`]: {
      ...transition.fadeIn('&'),
      ...transition.fadeOut('&'),
    },
    '>li': {
      display: 'block',
      padding: 0,
      margin: 0,
    },
  };
});

export type DropdownSubmenuItemButtonStyleProps = {
  disabled?: boolean;
};

const DropdownSubmenuItemButton = styled(BaseButton, {
  name: displayName,
  slot: 'Button',
})<DropdownSubmenuItemButtonStyleProps>(({ theme, styleProps }) => {
  const { color, transition, typography, clsPrefix } = theme;

  const { disabled } = styleProps;

  const styles: CSSObject = {
    padding: '5px 12px',
    transition: transition.standard('all'),
    color: color.text.primary,
    // 不设置会导致有间隙，原因未知
    width: '100%',
    textAlign: 'left',
    ...typography.body2,
    [`.${clsPrefix}-base-button__inner`]: {
      paddingRight: 14 + 4,
    },
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

const DropdownSubmenuIcon = styled(Icon, {
  name: displayName,
  slot: 'Icon',
})(() => {
  return {
    position: 'absolute',
    right: 0,
    top: 2,
  };
});

const DropdownSubmenuPopup = styled('ul', {
  name: displayName,
  slot: 'Popup',
})(({ theme }) => {
  const { color, elevations, shape } = theme;

  return {
    backgroundColor: color.background.paper,
    color: color.text.primary,
    borderRadius: shape.borderRadius.md,
    padding: '5px 0',
    listStyle: 'none',
    margin: 0,
    ...elevations(8),
  };
});

const defaultTrigger: Array<PopperTrigger> = ['click', 'hover'];
const defaultGetPopupContainer = () => document.body;

const DropdownSubmenu = React.forwardRef<HTMLDivElement, DropdownSubmenuProps>((props, ref) => {
  const {
    title,
    children,
    placement = 'right-start',
    transitionClassName,
    className,
    offset = 8,
    trigger = defaultTrigger,
    visible: visibleProp,
    defaultVisible = false,
    onVisibleChange,
    getPopupContainer = defaultGetPopupContainer,
    disabled,
    ...others
  } = props;

  const [visible, setVisible] = usePropChange(defaultVisible, visibleProp, onVisibleChange);

  const { clsPrefix } = React.useContext(ThemeContext);
  const { submenuCloseHandlers } = React.useContext(DropdownContext);

  const handleVisibleChange = useEventCallback((newVisible: boolean) => {
    if (disabled) {
      return;
    }
    setVisible(newVisible);
  });

  React.useEffect(() => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const closeHandler = () => {
      return setVisible(false);
    };
    submenuCloseHandlers.push(closeHandler);
    return () => {
      const index = submenuCloseHandlers.indexOf(closeHandler);
      if (index > -1) {
        submenuCloseHandlers.splice(index, 1);
      }
    };
  }, [submenuCloseHandlers, setVisible]);

  const rootClassName = `${clsPrefix}-dropdown-submenu`;

  const rootClasses = clsx(
    rootClassName,
    {
      [`${rootClassName}--disabled`]: disabled,
    },
    className,
  );

  const popup = (
    <DropdownSubmenuPopup className={`${rootClassName}__popup`}>{children}</DropdownSubmenuPopup>
  );

  return (
    <DropdownSubmenuRoot
      {...others}
      ref={ref}
      className={rootClasses}
      disablePopupEnter={false}
      visible={visible}
      onVisibleChange={handleVisibleChange}
      trigger={trigger}
      placement={placement}
      popup={popup}
      offset={offset}
      getPopupContainer={getPopupContainer}
      transitionClasses={clsx(rootClassName, transitionClassName)}
    >
      <li className={`${rootClassName}__inner`}>
        <DropdownSubmenuItemButton
          styleProps={{ disabled }}
          // cant use prop disabled
          // see https://github.com/facebook/react/issues/10109
          // disabled={disabled}
          aria-disabled={disabled}
          disableRipple={disabled}
          className={`${rootClassName}__button`}
        >
          {title}
          <DropdownSubmenuIcon className={`${rootClassName}__icon`}>
            <RightOutlined />
          </DropdownSubmenuIcon>
        </DropdownSubmenuItemButton>
      </li>
    </DropdownSubmenuRoot>
  );
});

if (env.isDevelopment) {
  DropdownSubmenu.displayName = displayName;

  const triggerPropType = PropTypes.oneOf<PopperTrigger>([
    'click',
    'contextMenu',
    'custom',
    'focus',
    'hover',
  ]).isRequired;

  DropdownSubmenu.propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    placement: PropTypes.oneOf<PopperPlacement>([
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
      'auto',
      'auto-start',
      'auto-end',
    ]),
    transitionClassName: PropTypes.string,
    offset: PropTypes.number,
    trigger: PropTypes.oneOfType([triggerPropType, PropTypes.arrayOf(triggerPropType)]),
    visible: PropTypes.bool,
    defaultVisible: PropTypes.bool,
    disabled: PropTypes.bool,
    onVisibleChange: PropTypes.func,
    getPopupContainer: PropTypes.func,
    className: PropTypes.string,
  };
}

export default DropdownSubmenu;
