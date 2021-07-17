import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { env } from '@xl-vision/utils';
import { styled } from '../styles';
import ThemeContext from '../ThemeProvider/ThemeContext';
import { ColProps } from './Col';
import RowContext from './RowContext';
import useMedia from './useMedia';

export type RowAlign = 'top' | 'middle' | 'bottom';
export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between';

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: RowAlign;
  children: React.ReactElement<ColProps> | Array<React.ReactElement<ColProps>>;
  className?: string;
  gutter?: number | Partial<Record<string, number>>;
  justify?: RowJustify;
  type?: 'flex';
}

const displayName = 'Row';

const RowRoot = styled('div', {
  name: displayName,
  slot: 'Root',
})<{
  align: RowProps['align'];
  justify: RowProps['justify'];
  type: RowProps['type'];
}>(({ theme, styleProps }) => {
  const { align, justify, type } = styleProps;
  const { mixins } = theme;

  const alignItems =
    align === 'top'
      ? 'flex-start'
      : align === 'middle'
      ? 'center'
      : align === 'bottom'
      ? 'flex-end'
      : undefined;

  const justifyContent =
    justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : justify;

  return {
    position: 'relative',
    boxSizing: 'border-box',
    ...mixins.clearfix,
    ...(type === 'flex' && {
      display: 'flex',
      flexDirection: 'row',
      justifyContent,
      alignItems,
      '&::after': {
        display: 'none',
      },
    }),
  };
});

const Row = React.forwardRef<HTMLDivElement, RowProps>((props, ref) => {
  const { align, justify, children, gutter, type, style, className, ...others } = props;

  const { breakpoints, clsPrefix } = React.useContext(ThemeContext);

  const matches = useMedia(breakpoints.values, breakpoints.unit);

  const computedGutter = React.useMemo(() => {
    if (typeof gutter === 'number') {
      return gutter;
    }
    if (typeof gutter === 'object') {
      for (let i = 0; i < matches.length; i++) {
        const breakPoint = matches[i];
        if (gutter[breakPoint] !== undefined) {
          return gutter[breakPoint] as number;
        }
      }
    }
    return 0;
  }, [matches, gutter]);

  const rowStyle =
    computedGutter > 0
      ? {
          marginLeft: computedGutter / -2,
          marginRight: computedGutter / -2,
          ...style,
        }
      : style;

  const isFlex = type === 'flex';

  const rootClassName = `${clsPrefix}-row`;

  const rootClasses = clsx(
    rootClassName,
    {
      [`${rootClassName}--flex`]: isFlex,
      [`${rootClassName}--justify-${justify}`]: isFlex && justify,
      [`${rootClassName}--align-${align}`]: isFlex && align,
    },
    className,
  );

  const memorizedValue = React.useMemo(() => ({ matches, gutter: computedGutter }), [
    matches,
    computedGutter,
  ]);

  return (
    <RowContext.Provider value={memorizedValue}>
      <RowRoot
        {...others}
        style={rowStyle}
        className={rootClasses}
        styleProps={{
          align,
          justify,
          type,
        }}
        ref={ref}
      >
        {children}
      </RowRoot>
    </RowContext.Provider>
  );
});

if (env.isDevelopment) {
  Row.displayName = displayName;

  Row.propTypes = {
    align: PropTypes.oneOf(['top', 'middle', 'bottom']),
    justify: PropTypes.oneOf(['start', 'end', 'center', 'space-around', 'space-between']),
    type: PropTypes.oneOf(['flex']),
    gutter: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.object.isRequired]),
    children: PropTypes.oneOfType([
      PropTypes.element.isRequired,
      PropTypes.arrayOf(PropTypes.element.isRequired),
    ]).isRequired,
    style: PropTypes.object,
    className: PropTypes.string,
  };
}

export default Row;
