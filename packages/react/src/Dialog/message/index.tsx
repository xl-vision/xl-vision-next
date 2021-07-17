import React from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@xl-vision/icons';
import { env } from '@xl-vision/utils';
import { ThemeContext } from '../../ThemeProvider';
import MessageDialog, { MessageDialogProps } from './MessageDialog';
import { LocalizationContext } from '../../LocalizationProvider';
import Icon from '../../Icon';

export type MessageDialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export * from './MessageDialog';

const createMessageDialog = (type?: MessageDialogType) => {
  const Dialog: React.FunctionComponent<MessageDialogProps> = (props) => {
    const themeContext = React.useContext(ThemeContext);
    const localizationContext = React.useContext(LocalizationContext);

    const defaultProps: Partial<MessageDialogProps> = React.useMemo(() => {
      switch (type) {
        case 'success': {
          return {
            icon: (
              <Icon style={{ color: themeContext.color.themes.primary.color }}>
                <CheckCircleOutlined />
              </Icon>
            ),
            confirmText: localizationContext.locale.Dialog.messages.successText,
            prompt: true,
          };
        }
        case 'error': {
          return {
            icon: (
              <Icon style={{ color: themeContext.color.themes.error.color }}>
                <CloseCircleOutlined />
              </Icon>
            ),
            confirmText: localizationContext.locale.Dialog.messages.errorText,
            prompt: true,
          };
        }
        case 'warning': {
          return {
            icon: (
              <Icon style={{ color: themeContext.color.themes.warning.color }}>
                <ExclamationCircleOutlined />
              </Icon>
            ),
            confirmText: localizationContext.locale.Dialog.messages.warningText,
            prompt: true,
          };
        }
        case 'info': {
          return {
            icon: (
              <Icon style={{ color: themeContext.color.themes.info.color }}>
                <InfoCircleOutlined />
              </Icon>
            ),
            confirmText: localizationContext.locale.Dialog.messages.infoText,
            prompt: true,
          };
        }
        case 'confirm': {
          return {
            icon: (
              <Icon style={{ color: themeContext.color.themes.primary.color }}>
                <ExclamationCircleOutlined />
              </Icon>
            ),
            confirmText: localizationContext.locale.Dialog.messages.confirm.confirmText,
            cancelText: localizationContext.locale.Dialog.messages.confirm.cancelText,
          };
        }
        default: {
          return {};
        }
      }
    }, [themeContext, localizationContext]);

    return <MessageDialog {...defaultProps} {...props} />;
  };

  if (env.isDevelopment) {
    const displayName = type
      ? `${type.replace(/^./, (match) => match.toUpperCase())}Dialog`
      : 'CustomMessageDialog';
    Dialog.displayName = displayName;
  }

  return Dialog;
};

export default createMessageDialog;
