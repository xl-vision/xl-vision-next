import { env } from '@xl-vision/utils';
import React from 'react';

export type RendererProps = {};

const Renderer: React.FunctionComponent<RendererProps> = (props) => {
  const { ...others } = props;
  return <div {...others}>Renderer</div>;
};

if (env.isDevelopment) {
  Renderer.displayName = 'Renderer';
  Renderer.defaultProps = {};
}

export default Renderer;
