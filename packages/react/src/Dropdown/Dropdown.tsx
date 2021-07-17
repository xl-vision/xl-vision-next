import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { env } from '@xl-vision/utils';
import useEventCallback from '../hooks/useEventCallback';
import usePropChange from '../hooks/usePropChange';
import Popper, { PopperPlacement, PopperProps, PopperTrigger } from '../Popper';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';
import DropdownContext from './DropdownContext';

export interface DropdownProps
  extends Omit<PopperProps, 'popup' | 'arrow' | 'transitionClasses' | 'disablePopupEnter'> {
  children: React.ReactElement;
  menus: React.ReactNode;
  transitionClassName?: string;
}

const displayName = 'Dropdown';

const DropdownRoot = styled(Popper, {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { clsPrefix, transition } = theme;

  return {
    [`.${clsPrefix}-dropdown`]: {
      ...transition.fadeIn('&'),
      ...transition.fadeOut('&'),
    },
  };
});

const DropdownPopup = styled('ul', {
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

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
  const {
    menus,
    children,
    placement = 'bottom',
    transitionClassName,
    offset = 12,
    trigger = 'hover',
    visible: visibleProp,
    defaultVisible = false,
    onVisibleChange,
    getPopupContainer,
    className,
    ...others
  } = props;

  const { clsPrefix } = React.useContext(ThemeContext);

  const submenuCloseHandlersRef = React.useRef<Array<() => void>>([]);

  const [visible, setVisible] = usePropChange(
    defaultVisible,
    visibleProp,
    onVisibleChange,
    (newVisibleProp) => {
      if (!newVisibleProp) {
        submenuCloseHandlersRef.current.forEach((it) => it());
      }
    },
  );

  const setVisibleWrapper = useEventCallback((newVisible: boolean) => {
    if (!newVisible) {
      submenuCloseHandlersRef.current.forEach((it) => it());
    }
    setVisible(newVisible);
  });

  const rootClassName = `${clsPrefix}-dropdown`;

  const rootClasses = clsx(rootClassName, className);

  const memorizedValue = React.useMemo(() => {
    return {
      submenuCloseHandlers: submenuCloseHandlersRef.current,
      setVisible: setVisibleWrapper,
    };
  }, [setVisibleWrapper]);

  const popup = (
    <DropdownPopup className={`${rootClassName}__popup`}>
      <DropdownContext.Provider value={memorizedValue}>{menus}</DropdownContext.Provider>
    </DropdownPopup>
  );

  return (
    <DropdownRoot
      {...others}
      ref={ref}
      className={rootClasses}
      disablePopupEnter={false}
      visible={visible}
      // eslint-disable-next-line react/jsx-handler-names
      onVisibleChange={setVisible}
      trigger={trigger}
      placement={placement}
      popup={popup}
      offset={offset}
      getPopupContainer={getPopupContainer}
      transitionClasses={transitionClassName || rootClassName}
    >
      {children}
    </DropdownRoot>
  );
});

if (env.isDevelopment) {
  Dropdown.displayName = displayName;

  const triggerPropType = PropTypes.oneOf<PopperTrigger>([
    'click',
    'contextMenu',
    'custom',
    'focus',
    'hover',
  ]).isRequired;

  Dropdown.propTypes = {
    menus: PropTypes.node.isRequired,
    children: PropTypes.element.isRequired,
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
    className: PropTypes.string,
    offset: PropTypes.number,
    trigger: PropTypes.oneOfType([triggerPropType, PropTypes.arrayOf(triggerPropType)]),
    visible: PropTypes.bool,
    defaultVisible: PropTypes.bool,
    onVisibleChange: PropTypes.func,
    getPopupContainer: PropTypes.func,
  };
}

export default Dropdown;
