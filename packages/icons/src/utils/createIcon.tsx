import React from 'react';
import { env } from '@xl-vision/utils';

export default (svg: React.ReactElement<React.SVGProps<SVGSVGElement>>, displayName: string) => {
  const Component = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
    return React.cloneElement(svg, {
      ...props,
      ref,
    });
  });

  if (env.isDevelopment) {
    Component.displayName = displayName;
  }
  return Component;
};
