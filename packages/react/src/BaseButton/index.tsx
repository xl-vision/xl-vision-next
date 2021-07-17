import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { env } from '@xl-vision/utils';
import useEventCallback from '../hooks/useEventCallback';
import Ripple, { RippleRef } from '../Ripple';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';

export type BaseButtonCommonProps =
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>;

export type BaseButtonProps = BaseButtonCommonProps & {
  disabled?: boolean;
  loading?: boolean;
  disableRipple?: boolean;
};

const displayName = 'BaseButton';

export type BaseButtonStyleProps = {
  loading?: boolean;
  disabled?: boolean;
};

const BaseButtonRoot = (styled('button', {
  name: displayName,
  slot: 'Root',
})<BaseButtonStyleProps>(({ styleProps, theme }) => {
  const { disabled, loading } = styleProps;
  const { clsPrefix, color } = theme;
  return {
    position: 'relative',
    display: 'inline-block',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    textDecoration: 'none',
    verticalAlign: 'middle',
    backgroundColor: 'transparent',
    border: 0,
    borderRadius: 0,
    outline: 0,
    userSelect: 'none',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    MozAppearance: 'none',
    WebkitAppearance: 'none',
    '&::-moz-focus-inner': {
      borderStyle: 'none', // Remove Firefox dotted outline.
    },

    // https://github.com/facebook/react/issues/4492#issuecomment-426356566
    svg: {
      pointerEvents: 'none',
    },

    [`.${clsPrefix}-base-button__ripple`]: {
      transform: 'scale(1)',
      opacity: color.action.pressed,
      '&-enter-active': {
        transition: theme.transition.enter('all'),
      },
      '&-leave-active': {
        transition: theme.transition.leavePermanent('all'),
      },
      '&-enter-from': {
        transform: 'scale(0)',
        opacity: 0.1,
      },
      '&-leave-to': {
        opacity: 0,
      },
    },
  };
  // fix type warning
}) as unknown) as React.ComponentType<any>;

const BaseButtonInner = styled('span', {
  name: displayName,
  slot: 'Inner',
})(() => {
  return {
    // 阻止ie下 focus时文字移动
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    height: '100%',
  };
});

const BaseButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, BaseButtonProps>(
  (props, ref) => {
    const {
      children,
      disabled,
      loading,
      disableRipple,
      className,
      tabIndex,
      onClick,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchEnd,
      onTouchMove,
      onDragLeave,
      onBlur,
      onKeyDown,
      onKeyUp,
      ...others
    } = props;

    const { clsPrefix } = React.useContext(ThemeContext);

    const Component = ((others as unknown) as HTMLAnchorElement).href ? 'a' : 'button';

    const rippleRef = React.useRef<RippleRef>(null);
    const isKeyDownRef = React.useRef(false);

    // 按钮切换到loading或者disabled时，强制触发stop
    React.useEffect(() => {
      if (loading || disabled) {
        if (rippleRef.current) {
          rippleRef.current.stop();
        }
      }
    }, [loading, disabled]);

    const shouldEnableRipple = !disableRipple && !disabled && !loading;

    const useRippleHandler = <E extends React.SyntheticEvent, H extends React.EventHandler<E>>(
      action: keyof RippleRef,
      defaultEventHandler?: H,
      disableRippleAction = !shouldEnableRipple,
    ) => {
      return useEventCallback((e: E) => {
        defaultEventHandler?.(e);

        if (!disableRippleAction && rippleRef.current) {
          rippleRef.current[action](e);
        }
      });
    };

    const handleMouseDown = useRippleHandler('start', onMouseDown);
    const handleMouseUp = useRippleHandler('stop', onMouseUp);
    const handleMouseLeave = useRippleHandler('stop', onMouseLeave);
    const handleDragLeave = useRippleHandler('stop', onDragLeave);
    const handleTouchStart = useRippleHandler('start', onTouchStart);
    const handleTouchEnd = useRippleHandler('stop', onTouchEnd);
    const handleTouchMove = useRippleHandler('stop', onTouchMove);
    const handleBlur = useRippleHandler('stop', onBlur, false);

    const handleKeyDown: typeof onKeyDown = useEventCallback((e) => {
      if (rippleRef.current && !isKeyDownRef.current && e.key === ' ') {
        isKeyDownRef.current = true;
        rippleRef.current.start();
      }

      onKeyDown?.(e);
    });
    const handleKeyUp: typeof onKeyUp = useEventCallback((e) => {
      if (rippleRef.current && isKeyDownRef.current && e.key === ' ') {
        isKeyDownRef.current = false;
        rippleRef.current.stop();
      }
      onKeyUp?.(e);
    });

    const handleClick: typeof onClick = useEventCallback((e) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    });

    const rootClassName = `${clsPrefix}-base-button`;

    const rootClasses = clsx(
      rootClassName,
      {
        [`${rootClassName}--loading`]: loading,
        [`${rootClassName}--disabled`]: disabled,
      },
      className,
    );

    return (
      <BaseButtonRoot
        {...others}
        as={Component}
        ref={ref}
        disabled={disabled}
        // 非激活状态不允许选中
        tabIndex={loading || disabled ? -1 : tabIndex}
        className={rootClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onBlur={handleBlur}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onDragLeave={handleDragLeave}
        styleProps={{ loading, disabled }}
      >
        <BaseButtonInner className={`${rootClassName}__inner`}>{children}</BaseButtonInner>
        <Ripple
          ref={rippleRef}
          leaveAfterEnter={true}
          className={`${rootClassName}__ripple`}
          transitionClasses={`${rootClassName}__ripple`}
        />
      </BaseButtonRoot>
    );
  },
);

if (env.isDevelopment) {
  BaseButton.displayName = displayName;

  BaseButton.propTypes = {
    children: PropTypes.node,
    href: PropTypes.string,
    disabled: PropTypes.bool,
    disableRipple: PropTypes.bool,
    loading: PropTypes.bool,
    className: PropTypes.string,
    tabIndex: PropTypes.number,
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchEnd: PropTypes.func,
    onTouchMove: PropTypes.func,
    onDragLeave: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
  };
}

export default BaseButton;
