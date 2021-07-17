import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import React from 'react';
import { env } from '@xl-vision/utils';
import warning from '../utils/warning';

export type PortalContainerReturnType = Element | string | undefined | null;
export type PortalContainerType = PortalContainerReturnType | (() => PortalContainerReturnType);

export interface PortalProp {
  children: React.ReactElement;
  getContainer?: PortalContainerType;
}

/**
 * 支持服务端渲染
 * getContainer支持传递父元素，字符串或者undefined,也可以通过函数返回
 * 如果传递字符串，则根据字符串进行查询节点
 * 如果是undefined，则直接挂载在当前位置
 * @param props
 * @constructor
 */
const Portal: React.FunctionComponent<PortalProp> = (props) => {
  const { children, getContainer } = props;

  if (env.isServer) {
    return null;
  }

  let container: PortalContainerType;

  if (typeof getContainer === 'function') {
    container = getContainer();
  } else {
    container = getContainer;
  }

  if (!container) {
    return children;
  }

  if (typeof container === 'string') {
    const selector = document.querySelector(container);
    warning(!selector, '<Portal> querySelector "%s" is null', container);
    return ReactDOM.createPortal(children, selector!);
  }

  return ReactDOM.createPortal(children, container);
};

if (env.isDevelopment) {
  Portal.displayName = 'Portal';

  Portal.propTypes = {
    children: PropTypes.element.isRequired,
    getContainer: PropTypes.any,
  };
}

export default Portal;
