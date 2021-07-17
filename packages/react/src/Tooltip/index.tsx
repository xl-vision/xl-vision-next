import PropTypes from 'prop-types';
import clsx from 'clsx';
import React from 'react';
import { env } from '@xl-vision/utils';
import Popper, { PopperChildrenProps, PopperProps, PopperTrigger } from '../Popper';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';
import useEventCallback from '../hooks/useEventCallback';
import { oneOf } from '../utils/function';
import usePropChange from '../hooks/usePropChange';

export interface TooltipChildrenProps extends PopperChildrenProps {
  onTouchStart?: React.TouchEventHandler<any>;
  onTouchEnd?: React.TouchEventHandler<any>;
}

export type TooltipTrigger = PopperTrigger | 'touch';

export interface TooltipProps
  extends Omit<PopperProps, 'popup' | 'arrow' | 'transitionClasses' | 'children' | 'trigger'> {
  content: React.ReactNode;
  transitionClassName?: string;
  bgColor?: string;
  maxWidth?: number | string;
  showArrow?: boolean;
  children: React.ReactElement<TooltipChildrenProps>;
  trigger?: TooltipTrigger | Array<TooltipTrigger>;
  touchShowDelay?: number;
  touchHideDelay?: number;
}

const displayName = 'Tooltip';

const TooltipRoot = styled(Popper, {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { clsPrefix, transition } = theme;

  return {
    [`.${clsPrefix}-tooltip`]: {
      ...transition.fadeIn('&'),
      ...transition.fadeOut('&'),
    },
  };
});

export type TooltipPopupStyleProps = {
  hasWidth: boolean;
  touch?: boolean;
};

const TooltipPopup = styled('div', {
  name: displayName,
  slot: 'Popup',
})<TooltipPopupStyleProps>(({ theme, styleProps }) => {
  const { color, typography, shape } = theme;
  const { hasWidth, touch } = styleProps;

  const bgColor = color.modes.dark.background.paper;

  return {
    backgroundColor: bgColor,
    color: color.getContrastText(bgColor).text.primary,
    padding: touch ? '8px 16px' : '4px 8px',
    borderRadius: shape.borderRadius.md,

    ...typography.caption,
    ...(hasWidth && {
      whiteSpace: 'pre-wrap',
      textAlign: 'justify',
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    }),
  };
});

const TooltipArrow = styled('div', {
  name: displayName,
  slot: 'Arrow',
})(({ theme }) => {
  const { color } = theme;
  const bgColor = color.modes.dark.background.paper;

  return {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: bgColor,

    ':before': {
      position: 'absolute',
      content: '""',
      width: '8px',
      height: '8px',
      left: '-4px',
      top: '-4px',
      transform: 'rotate(45deg)',
      backgroundColor: 'inherit',
    },
    '&[data-placement^="left"]': {
      right: 0,
    },
    '&[data-placement^="right"]': {
      left: 0,
    },
    '&[data-placement^="top"]': {
      bottom: 0,
    },
    '&[data-placement^="bottom"]': {
      top: 0,
    },
  };
});

const defaultTrigger: Array<TooltipTrigger> = ['hover', 'touch'];

const TIME_DELAY = 300;

const Tooltip = React.forwardRef<unknown, TooltipProps>((props, ref) => {
  const { clsPrefix, color } = React.useContext(ThemeContext);

  const {
    content,
    getPopupContainer,
    className,
    transitionClassName,
    bgColor,
    maxWidth,
    offset = 12,
    touchHideDelay = 0,
    touchShowDelay = 1500,
    // 支持触屏设备
    trigger = defaultTrigger,
    visible: visibleProp,
    defaultVisible = false,
    onVisibleChange,
    showArrow,
    children,
    onAfterClosed,
    ...others
  } = props;

  const child = React.Children.only<React.ReactElement<TooltipChildrenProps>>(children);

  const [visible, setVisible] = usePropChange(defaultVisible, visibleProp, onVisibleChange);

  const [touch, setTouch] = React.useState(false);

  const extraTriggers = React.useMemo(() => {
    const triggers = Array.isArray(trigger) ? trigger : [trigger];
    return triggers.filter((it) => it !== 'touch') as Array<PopperTrigger>;
  }, [trigger]);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleVisibleChange = useEventCallback((visible: boolean) => {
    // 当前正处于touch事件中，阻止其他事件
    if (touch) {
      return;
    }
    setVisible(visible);
  });

  const touchDelayTimerRef = React.useRef<NodeJS.Timeout>();

  const prevUserSelectRef = React.useRef<string>();

  const stopTouchInteraction = React.useCallback(() => {
    if (prevUserSelectRef.current !== undefined) {
      document.body.style.webkitUserSelect = prevUserSelectRef.current;
      prevUserSelectRef.current = undefined;
    }
    if (touchDelayTimerRef.current !== undefined) {
      clearTimeout(touchDelayTimerRef.current);
      touchDelayTimerRef.current = undefined;
    }
  }, []);

  const isTouchTrigger = useEventCallback(() => {
    const triggers = Array.isArray(trigger) ? trigger : [trigger];
    if (oneOf(triggers, 'custom')) {
      return false;
    }
    return oneOf(triggers, 'touch');
  });

  const handleReferenceTouchStart: React.TouchEventHandler<any> = useEventCallback((e) => {
    if (isTouchTrigger()) {
      stopTouchInteraction();
      prevUserSelectRef.current = document.body.style.webkitUserSelect;
      // Prevent iOS text selection on long-tap.
      document.body.style.webkitUserSelect = 'none';
      setTouch(true);
      touchDelayTimerRef.current = setTimeout(() => {
        stopTouchInteraction();
        setVisible(true);
      }, touchShowDelay);
    }

    child.props?.onTouchStart?.(e);
  });

  const handleReferenceTouchEnd: React.TouchEventHandler<any> = useEventCallback((e) => {
    if (isTouchTrigger()) {
      // call after mouseenter
      stopTouchInteraction();
      touchDelayTimerRef.current = setTimeout(() => {
        setVisible(false);
        touchDelayTimerRef.current = undefined;
        // 移动设备也会触发mouseenter、click等事件，会有200-300ms延迟，这里阻止popper内部事件触发
      }, Math.max(touchHideDelay, TIME_DELAY));
    }
    child.props?.onTouchEnd?.(e);
  });

  const handleAfterClosed = useEventCallback(() => {
    if (touch) {
      setTouch(false);
    }
    onAfterClosed?.();
  });

  React.useEffect(() => {
    return () => {
      stopTouchInteraction();
    };
  }, [stopTouchInteraction]);

  const rootClassName = `${clsPrefix}-tooltip`;

  const colorStyle = bgColor && {
    backgroundColor: bgColor,
    color: color.getContrastText(bgColor).text.primary,
  };

  const popup = (
    <TooltipPopup
      styleProps={{
        hasWidth: maxWidth !== undefined,
        touch,
      }}
      className={clsx(`${rootClassName}__popup`, {
        [`${rootClassName}--width`]: maxWidth !== undefined,
      })}
      style={{ maxWidth, ...colorStyle }}
    >
      {content}
    </TooltipPopup>
  );

  const arrow = <TooltipArrow style={{ ...colorStyle }} className={`${rootClassName}__arrow`} />;

  const rootClasses = clsx(rootClassName, className);

  return (
    <TooltipRoot
      role='tooltip'
      {...others}
      ref={ref}
      onAfterClosed={handleAfterClosed}
      visible={visible}
      onVisibleChange={handleVisibleChange}
      trigger={extraTriggers}
      className={rootClasses}
      offset={offset}
      popup={popup}
      arrow={showArrow ? arrow : undefined}
      getPopupContainer={getPopupContainer}
      transitionClasses={transitionClassName || rootClassName}
    >
      {React.cloneElement(child, {
        onTouchStart: handleReferenceTouchStart,
        onTouchEnd: handleReferenceTouchEnd,
      })}
    </TooltipRoot>
  );
});

if (env.isDevelopment) {
  Tooltip.displayName = displayName;

  const triggerPropType = PropTypes.oneOf<TooltipTrigger>([
    'click',
    'contextMenu',
    'custom',
    'focus',
    'hover',
    'touch',
  ]).isRequired;

  Tooltip.propTypes = {
    content: PropTypes.node,
    getPopupContainer: PropTypes.func,
    className: PropTypes.string,
    transitionClassName: PropTypes.string,
    bgColor: PropTypes.string,
    maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    offset: PropTypes.number,
    trigger: PropTypes.oneOfType([triggerPropType, PropTypes.arrayOf(triggerPropType)]),
    showArrow: PropTypes.bool,
    onAfterClosed: PropTypes.func,
    touchHideDelay: PropTypes.number,
    touchShowDelay: PropTypes.number,
    visible: PropTypes.bool,
    defaultVisible: PropTypes.bool,
    onVisibleChange: PropTypes.func,
    children: PropTypes.element.isRequired,
  };
}

export default Tooltip;
