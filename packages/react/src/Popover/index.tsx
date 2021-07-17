import clsx from 'clsx';
import React from 'react';
import PropTypes from 'prop-types';
import { env } from '@xl-vision/utils';
import Popper, { PopperProps, PopperTrigger } from '../Popper';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';

export interface PopoverProps
  extends Omit<PopperProps, 'popup' | 'arrow' | 'transitionClasses' | 'title'> {
  title?: React.ReactNode;
  content: React.ReactNode;
  transitionClassName?: string;
  showArrow?: boolean;
}

const displayName = 'Popover';

const PopoverRoot = styled(Popper, {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { clsPrefix, transition } = theme;

  return {
    [`.${clsPrefix}-popover`]: {
      ...transition.fadeIn('&'),
      ...transition.fadeOut('&'),
    },
  };
});

const PopoverArrow = styled('div', {
  name: displayName,
  slot: 'Arrow',
})(({ theme }) => {
  const { color } = theme;
  const bgColor = color.background.paper;

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

const PopoverPopup = styled('div', {
  name: displayName,
  slot: 'Popup',
})(({ theme }) => {
  const { color, elevations } = theme;
  const bgColor = color.background.paper;

  return {
    backgroundColor: bgColor,
    color: color.getContrastText(bgColor).text.primary,
    borderRadius: 4,
    minWidth: 160,
    ...elevations(8),
  };
});

const PopoverTitle = styled('div', {
  name: displayName,
  slot: 'Title',
})(({ theme }) => {
  const { color, typography } = theme;
  return {
    padding: '4px 12px',
    borderBottom: `1px solid ${color.divider}`,
    ...typography.subtitle2,
  };
});

const PopoverContent = styled('div', {
  name: displayName,
  slot: 'Content',
})(({ theme }) => {
  const { typography } = theme;
  return {
    padding: '8px 12px',
    ...typography.body2,
  };
});

const Popover = React.forwardRef<unknown, PopoverProps>((props, ref) => {
  const {
    title,
    content,
    getPopupContainer,
    className,
    transitionClassName,
    offset = 12,
    // 支持触屏设备
    trigger = 'click',
    showArrow,
    ...others
  } = props;

  const { clsPrefix } = React.useContext(ThemeContext);

  const rootClassName = `${clsPrefix}-popover`;

  const popup = (
    <PopoverPopup className={clsx(`${rootClassName}__popup`)}>
      {title && <PopoverTitle className={`${rootClassName}__title`}>{title}</PopoverTitle>}
      <PopoverContent className={`${rootClassName}__content`}>{content}</PopoverContent>
    </PopoverPopup>
  );

  const arrow = <PopoverArrow className={`${rootClassName}__arrow`} />;

  const rootClasses = clsx(rootClassName, className);

  return (
    <PopoverRoot
      role='tooltip'
      {...others}
      ref={ref}
      trigger={trigger}
      className={rootClasses}
      offset={offset}
      arrow={showArrow ? arrow : undefined}
      popup={popup}
      getPopupContainer={getPopupContainer}
      transitionClasses={transitionClassName || rootClassName}
    />
  );
});

if (env.isDevelopment) {
  Popover.displayName = displayName;

  const triggerPropType = PropTypes.oneOf<PopperTrigger>([
    'click',
    'contextMenu',
    'custom',
    'focus',
    'hover',
  ]).isRequired;

  Popover.propTypes = {
    title: PropTypes.node,
    content: PropTypes.node.isRequired,
    getPopupContainer: PropTypes.func,
    className: PropTypes.string,
    transitionClassName: PropTypes.string,
    offset: PropTypes.number,
    trigger: PropTypes.oneOfType([triggerPropType, PropTypes.arrayOf(triggerPropType)]),
    showArrow: PropTypes.bool,
  };
}

export default Popover;
