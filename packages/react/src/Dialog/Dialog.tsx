import React from 'react';
import clsx from 'clsx';
import Proptypes from 'prop-types';
import { env } from '@xl-vision/utils';
import Modal, { ModalProps } from '../Modal';
import ThemeContext from '../ThemeProvider/ThemeContext';
import { styled } from '../styles';
import Button, { ButtonProps } from '../Button';
import usePropChange from '../hooks/usePropChange';
import useEventCallback from '../hooks/useEventCallback';
import LocalizationContext from '../LocalizationProvider/LocalizationContext';

export type DialogButtonProps = Omit<ButtonProps, 'children' | 'onClick'>;

export interface DialogProps extends Omit<ModalProps, 'bodyProps' | 'title' | 'children'> {
  title: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  prompt?: boolean;
  confirmButtonProps?: DialogButtonProps;
  cancelButtonProps?: DialogButtonProps;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

const displayName = 'Dialog';

const DialogRoot = styled(Modal, {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { color, elevations, shape } = theme;
  return {
    backgroundColor: color.background.paper,
    borderRadius: shape.borderRadius.md,
    maxWidth: 560,
    margin: 32,
    maxHeight: 'calc(100% - 64px)',
    display: 'flex',
    flexDirection: 'column',
    ...elevations(24),
  };
});

const DialogHeader = styled('div', {
  name: displayName,
  slot: 'Header',
})(({ theme }) => {
  const { clsPrefix, typography, color } = theme;
  return {
    color: color.text.primary,
    padding: '16px 24px',
    [`.${clsPrefix}-dialog__title`]: {
      ...typography.h6,
      margin: 0,
    },
  };
});

const DialogContent = styled('div', {
  name: displayName,
  slot: 'Content',
})(({ theme }) => {
  const { typography, color } = theme;

  return {
    padding: '8px 24px',
    overflowY: 'auto',
    flex: 1,
    color: color.text.secondary,
    ...typography.body1,
  };
});

const DialogFooter = styled('div', {
  name: displayName,
  slot: 'Footer',
})(() => {
  return {
    padding: 8,
    textAlign: 'right',
  };
});

const DialogActions = styled('div', {
  name: displayName,
  slot: 'Actions',
})(() => {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap-reverse',
  };
});

let uuid = 0;

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>((props, ref) => {
  const { locale } = React.useContext(LocalizationContext);

  const {
    children,
    title,
    footer,
    prompt,
    className,
    visible: visibleProp,
    onVisibleChange: onVisibleChangeProp,
    defaultVisible: defaultVisibleProp = false,
    onConfirm,
    onCancel,
    cancelText = locale.Dialog.cancelText,
    confirmText = locale.Dialog.confirmText,
    cancelButtonProps,
    confirmButtonProps,
    ...others
  } = props;

  const [visible, setVisible] = usePropChange(defaultVisibleProp, visibleProp, onVisibleChangeProp);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);

  const { clsPrefix } = React.useContext(ThemeContext);

  const [dialogTitleId, setDialogTitleId] = React.useState('');

  React.useEffect(() => {
    setDialogTitleId(`${clsPrefix}DialogTitle${uuid}`);
    uuid++;
  }, [clsPrefix]);

  const handleConfirm = useEventCallback(() => {
    if (onConfirm) {
      const p = onConfirm();
      if (p && p.then) {
        setConfirmLoading(true);
        p.then(() => {
          setVisible(false);
          setConfirmLoading(false);
        }).catch(() => {
          setConfirmLoading(false);
        });
        return;
      }
    }
    setVisible(false);
  });

  const handleCancel = useEventCallback(() => {
    if (onCancel) {
      const p = onCancel();
      if (p && p.then) {
        setCancelLoading(true);
        p.then(() => {
          setVisible(false);
          setCancelLoading(false);
        }).catch(() => {
          setCancelLoading(false);
        });
        return;
      }
    }
    setVisible(false);
  });

  const handleVisibleChange = useEventCallback((_visible: boolean) => {
    setVisible(_visible);
    if (!_visible) {
      onCancel?.();
    }
  });

  const defaultFooterNode = (
    <DialogActions>
      {!prompt && (
        /** @ts-ignore */
        <Button
          theme='primary'
          variant='text'
          {...cancelButtonProps}
          loading={cancelLoading}
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
      )}
      {/** @ts-ignore */}
      <Button
        theme='primary'
        variant='text'
        {...confirmButtonProps}
        loading={confirmLoading}
        onClick={handleConfirm}
      >
        {confirmText}
      </Button>
    </DialogActions>
  );

  const rootClassName = `${clsPrefix}-dialog`;

  return (
    <DialogRoot
      ref={ref}
      aria-labelledby={dialogTitleId}
      {...others}
      className={clsx(rootClassName, className)}
      onVisibleChange={handleVisibleChange}
      visible={visible}
    >
      <DialogHeader id={dialogTitleId} className={`${rootClassName}__header`}>
        {typeof title === 'string' ? <h6 className={`${rootClassName}__title`}>{title}</h6> : title}
      </DialogHeader>
      {children && (
        <DialogContent className={`${rootClassName}__content`}>{children}</DialogContent>
      )}
      {footer !== null && (
        <DialogFooter className={`${rootClassName}__footer`}>
          {footer || defaultFooterNode}
        </DialogFooter>
      )}
    </DialogRoot>
  );
});

if (env.isDevelopment) {
  Dialog.displayName = displayName;
  Dialog.propTypes = {
    children: Proptypes.node,
    title: Proptypes.node.isRequired,
    footer: Proptypes.node,
    className: Proptypes.string,
    visible: Proptypes.bool,
    onVisibleChange: Proptypes.func,
    defaultVisible: Proptypes.bool,
    prompt: Proptypes.bool,
    onConfirm: Proptypes.func,
    onCancel: Proptypes.func,
    cancelText: Proptypes.string,
    confirmText: Proptypes.string,
    cancelButtonProps: Proptypes.object,
    confirmButtonProps: Proptypes.object,
  };
}

export default Dialog;
