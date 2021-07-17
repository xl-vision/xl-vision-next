import ReactDOM from 'react-dom';
import React from 'react';
import { ThemeContext as StyledThemeContext } from '@xl-vision/styled-engine';
import { env } from '@xl-vision/utils';
import createMessageDialog, { MessageDialogType, MessageDialogProps } from './message';
import { voidFn } from '../utils/function';
import warningLog from '../utils/warning';
import { Theme, ThemeContext } from '../ThemeProvider';
import { LocalizationContext, LocalizationContextProps } from '../LocalizationProvider';
import defaultTheme from '../ThemeProvider/defaultTheme';
import { locales, defaultLanguage } from '../locale';

export interface MessageDialogFunctionRenderProps extends MessageDialogProps, MessageDialogProps {
  themeContext?: Theme;
  localizationContext?: LocalizationContextProps;
}
export interface MessageDialogFunctionProps
  extends Omit<MessageDialogFunctionRenderProps, 'visible' | 'defaultVisible'> {}

export type MessageDialogFunctionUpdate = (
  props:
    | Partial<MessageDialogFunctionProps>
    | ((prev: MessageDialogFunctionProps) => Partial<MessageDialogFunctionProps>),
) => void;

export type MessageDialogFunctionReturnType = {
  destroy: () => void;
  update: MessageDialogFunctionUpdate;
};

const defaultThemeContext: Theme = defaultTheme;

const defaultLocalizationContext: LocalizationContextProps = {
  locale: locales[defaultLanguage],
  language: defaultLanguage,
};

const destroyFunctions: Array<() => void> = [];

const method = (
  props: MessageDialogFunctionProps,
  type?: MessageDialogType,
): MessageDialogFunctionReturnType => {
  if (env.isServer) {
    return {
      destroy: voidFn,
      update: voidFn,
    };
  }

  const Dialog = createMessageDialog(type);

  const div = document.createElement('div');
  document.body.appendChild(div);

  let currentProps: MessageDialogFunctionRenderProps = {
    ...props,
    visible: undefined,
    defaultVisible: true,
    onAfterClosed: () => {
      props.onAfterClosed?.();
      destroyDOM();
    },
  };

  let destroyState = false;

  const render = (renderProps: MessageDialogFunctionRenderProps) => {
    if (destroyState) {
      return warningLog(
        true,
        `The dialog instance was destroyed, please do not update or destroy it again.`,
      );
    }
    const { localizationContext, themeContext, ...others } = renderProps;

    setTimeout(() => {
      ReactDOM.render(
        <LocalizationContext.Provider value={localizationContext || defaultLocalizationContext}>
          <ThemeContext.Provider value={themeContext || defaultThemeContext}>
            <StyledThemeContext.Provider value={themeContext || defaultThemeContext}>
              <Dialog getContainer={null} {...others} />
            </StyledThemeContext.Provider>
          </ThemeContext.Provider>
        </LocalizationContext.Provider>,
        div,
      );
    });
  };

  const update: MessageDialogFunctionUpdate = (updateProps) => {
    const newProps = typeof updateProps === 'function' ? updateProps(currentProps) : updateProps;

    currentProps = {
      ...currentProps,
      ...newProps,
      visible: undefined,
      defaultVisible: true,
    };

    const { onAfterClosed: afterClose } = currentProps;

    currentProps.onAfterClosed = () => {
      afterClose?.();
      destroyDOM();
    };

    render(currentProps);
  };

  const destroyDOM = () => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    const i = destroyFunctions.indexOf(destroy);
    if (i > -1) {
      destroyFunctions.splice(i, 1);
    }
  };

  const destroy = () => {
    const { onAfterClosed: afterClose } = currentProps;
    render({
      ...currentProps,
      visible: false,
      onAfterClosed: () => {
        afterClose?.();
        destroyDOM();
      },
    });
    destroyState = true;
  };

  destroyFunctions.push(destroy);

  render(currentProps);

  return {
    destroy,
    update,
  };
};

export const open = (props: MessageDialogFunctionProps) => method(props);
export const info = (props: MessageDialogFunctionProps) => method(props, 'info');
export const success = (props: MessageDialogFunctionProps) => method(props, 'success');
export const warning = (props: MessageDialogFunctionProps) => method(props, 'warning');
export const error = (props: MessageDialogFunctionProps) => method(props, 'error');
export const confirm = (props: MessageDialogFunctionProps) => method(props, 'confirm');

export const destroyAll = () => {
  let fn = destroyFunctions.pop();
  while (fn) {
    fn();
    fn = destroyFunctions.pop();
  }
};
