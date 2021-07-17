import clsx from 'clsx';
import React from 'react';
import PropTypes from 'prop-types';
import { ExclamationCircleOutlined } from '@xl-vision/icons';
import { env } from '@xl-vision/utils';
import Popper, { PopperProps, PopperTrigger } from '../Popper';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';
import Button, { ButtonProps } from '../Button';
import LocalizationContext from '../LocalizationProvider/LocalizationContext';
import Icon from '../Icon';
import useEventCallback from '../hooks/useEventCallback';
import usePropChange from '../hooks/usePropChange';

export type PopconfirmButtonProps = Omit<ButtonProps, 'children' | 'onClick'>;
export interface PopconfirmProps
  extends Omit<PopperProps, 'popup' | 'arrow' | 'transitionClasses' | 'title'> {
  title: React.ReactNode;
  icon?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmButtonProps?: PopconfirmButtonProps;
  cancelButtonProps?: PopconfirmButtonProps;
  confirmText?: string;
  cancelText?: string;
  showArrow?: boolean;
  transitionClassName?: string;
}

const displayName = 'Popconfirm';

const PopconfirmRoot = styled(Popper, {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { clsPrefix, transition } = theme;

  return {
    [`.${clsPrefix}-popconfirm`]: {
      ...transition.fadeIn('&'),
      ...transition.fadeOut('&'),
    },
  };
});

const PopconfirmArrow = styled('div', {
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

const PopconfirmPopup = styled('div', {
  name: displayName,
  slot: 'Popup',
})(({ theme }) => {
  const { color, typography, elevations, clsPrefix, shape } = theme;
  const bgColor = color.background.paper;

  return {
    backgroundColor: bgColor,
    color: color.getContrastText(bgColor).text.primary,
    borderRadius: shape.borderRadius.md,
    padding: '12px 16px',
    ...elevations(8),
    [`.${clsPrefix}-popconfirm__content`]: {
      position: 'relative',
      padding: '4px 0px 12px',
      minWidth: 110,
      ...typography.body1,
    },
    [`.${clsPrefix}-popconfirm__icon`]: {
      position: 'absolute',
      top: typography.pxToRem(6),
      left: 0,
      color: color.themes.warning.color,
    },
    [`.${clsPrefix}-popconfirm__title`]: {
      paddingLeft: 22,
    },
    [`.${clsPrefix}-popconfirm__footer`]: {
      textAlign: 'right',
      button: {
        marginLeft: 8,
      },
    },
  };
});

const defaultIcon = (
  <Icon>
    <ExclamationCircleOutlined />
  </Icon>
);

const Popconfirm = React.forwardRef<unknown, PopconfirmProps>((props, ref) => {
  const { clsPrefix } = React.useContext(ThemeContext);
  const { locale } = React.useContext(LocalizationContext);

  const {
    getPopupContainer,
    className,
    offset = 12,
    trigger = 'click',
    title,
    icon = defaultIcon,
    visible: visibleProp,
    onVisibleChange,
    onCancel,
    onConfirm,
    defaultVisible = false,
    cancelButtonProps,
    confirmButtonProps,
    cancelText = locale.Popconfirm.cancelText,
    confirmText = locale.Popconfirm.confirmText,
    showArrow,
    transitionClassName,
    ...others
  } = props;

  const [visible, setVisible] = usePropChange(defaultVisible, visibleProp, onVisibleChange);

  const handleCancel = useEventCallback(() => {
    setVisible(false);
    onCancel?.();
  });

  const handleConfirm = useEventCallback(() => {
    setVisible(false);
    onConfirm?.();
  });

  const rootClassName = `${clsPrefix}-popconfirm`;

  const popup = (
    <PopconfirmPopup className={clsx(`${rootClassName}__popup`)}>
      <div className={`${rootClassName}__content`}>
        <span className={`${rootClassName}__icon`}>{icon}</span>
        <span className={`${rootClassName}__title`}>{title}</span>
      </div>
      <div className={`${rootClassName}__footer`}>
        {/** @ts-ignore */}
        <Button
          style={{ minWidth: 0 }}
          size='small'
          theme='primary'
          variant='text'
          {...cancelButtonProps}
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
        {/** @ts-ignore */}
        <Button
          style={{ minWidth: 0 }}
          size='small'
          theme='primary'
          variant='text'
          disableElevation={true}
          {...confirmButtonProps}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </PopconfirmPopup>
  );

  const arrow = <PopconfirmArrow className={`${rootClassName}__arrow`} />;

  const rootClasses = clsx(rootClassName, className);

  return (
    <PopconfirmRoot
      role='tooltip'
      {...others}
      visible={visible}
      // eslint-disable-next-line react/jsx-handler-names
      onVisibleChange={setVisible}
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
  Popconfirm.displayName = displayName;

  const triggerPropType = PropTypes.oneOf<PopperTrigger>([
    'click',
    'contextMenu',
    'custom',
    'focus',
    'hover',
  ]).isRequired;

  Popconfirm.propTypes = {
    getPopupContainer: PropTypes.func,
    onVisibleChange: PropTypes.func,
    visible: PropTypes.bool,
    title: PropTypes.node,
    className: PropTypes.string,
    offset: PropTypes.number,
    trigger: PropTypes.oneOfType([triggerPropType, PropTypes.arrayOf(triggerPropType)]),
    icon: PropTypes.node,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    cancelButtonProps: PropTypes.object,
    confirmButtonProps: PropTypes.object,
    cancelText: PropTypes.string,
    confirmText: PropTypes.string,
    defaultVisible: PropTypes.bool,
    showArrow: PropTypes.bool,
    transitionClassName: PropTypes.string,
  };
}

export default Popconfirm;
