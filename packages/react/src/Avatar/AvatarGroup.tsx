import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { env } from '@xl-vision/utils';
import Avatar, { AvatarProps, AvatarShape, AvatarSize, AvatarSizeType } from './Avatar';
import Popover from '../Popover';
import { styled } from '../styles';
import AvatarContext from './AvatarContext';
import ThemeContext from '../ThemeProvider/ThemeContext';

export type AvatarGroupPopupPlacement = 'none' | 'top' | 'bottom';

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  maxCount?: number;
  popupPlacement?: AvatarGroupPopupPlacement;
  size?: AvatarSize;
  children: React.ReactElement<AvatarProps> | Array<React.ReactElement<AvatarProps>>;
  maxStyle?: React.CSSProperties;
  shape?: AvatarShape;
};

const displayName = 'AvatarGroup';

const AvatarGroupRoot = styled('div', {
  name: displayName,
  slot: 'Root',
})(({ theme }) => {
  const { clsPrefix, color } = theme;
  return {
    [`.${clsPrefix}-avatar`]: {
      border: `1px solid ${color.background.paper}`,
      '&:not(:first-child)': {
        marginLeft: -8,
      },
    },
  };
});

const AvatarPopup = styled(Popover, {
  name: displayName,
  slot: 'Popup',
})(({ theme }) => {
  const { clsPrefix } = theme;

  return {
    [`.${clsPrefix}-avatar`]: {
      '&:not(:first-child)': {
        marginLeft: 8,
      },
    },
  };
});

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>((props, ref) => {
  const {
    children,
    className,
    maxCount,
    popupPlacement = 'top',
    size,
    shape,
    maxStyle,
    ...others
  } = props;

  const { clsPrefix } = React.useContext(ThemeContext);

  const childArray = React.Children.map<React.ReactElement, React.ReactElement>(
    children,
    // eslint-disable-next-line react/no-array-index-key
    (it, index) => React.cloneElement(it, { key: index }),
  );

  const rootClassName = `${clsPrefix}-avatar-group`;

  let showedChildren = children;

  if (maxCount && maxCount > 0) {
    showedChildren = childArray.slice(0, maxCount);
    const popupChildren = childArray.slice(maxCount);
    if (popupChildren.length > 0) {
      let popNode = (
        <Avatar key='avatar-group-max' className={`${rootClassName}__max`} style={maxStyle}>
          +{popupChildren.length}
        </Avatar>
      );

      if (popupPlacement !== 'none') {
        popNode = (
          <AvatarPopup
            key='avatar-group-max'
            className={`${rootClassName}__popup`}
            content={popupChildren}
            placement={popupPlacement}
            trigger={['hover', 'click']}
          >
            {popNode}
          </AvatarPopup>
        );
      }

      showedChildren.push(popNode);
    }
  }

  const rootClasses = clsx(rootClassName, className);

  return (
    <AvatarContext.Provider value={{ size, shape }}>
      <AvatarGroupRoot {...others} className={rootClasses} ref={ref}>
        {showedChildren}
      </AvatarGroupRoot>
    </AvatarContext.Provider>
  );
});

if (env.isDevelopment) {
  AvatarGroup.displayName = displayName;
  AvatarGroup.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element.isRequired).isRequired,
    className: PropTypes.string,
    maxCount: PropTypes.number,
    popupPlacement: PropTypes.oneOf<AvatarGroupPopupPlacement>(['none', 'top', 'bottom']),
    size: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.oneOf<AvatarSizeType>(['small', 'default', 'large']),
    ]),
    shape: PropTypes.oneOf<AvatarShape>(['round', 'circle', 'square']),
    maxStyle: PropTypes.object,
  };
}

export default AvatarGroup;
