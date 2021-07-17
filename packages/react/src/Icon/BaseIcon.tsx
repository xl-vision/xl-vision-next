import React from 'react';
import PropTypes from 'prop-types';
import { env } from '@xl-vision/utils';

export interface BaseIconProps extends React.SVGProps<SVGSVGElement> {
  children: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

const BaseIcon = React.forwardRef<SVGSVGElement, BaseIconProps>((props, ref) => {
  const { children, ...others } = props;
  return React.cloneElement(children, {
    ...others,
    ref,
  });
});

if (env.isDevelopment) {
  BaseIcon.displayName = 'BaseIcon';

  BaseIcon.propTypes = {
    children: PropTypes.element.isRequired,
  };
}

export default React.memo(BaseIcon);
