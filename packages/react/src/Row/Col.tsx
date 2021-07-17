import { CSSObject } from '@xl-vision/styled-engine-types';
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { env } from '@xl-vision/utils';
import { styled } from '../styles';
import RowContext from './RowContext';
import ThemeContext from '../ThemeProvider/ThemeContext';

export type ColSpanType = number | Partial<Record<string, number>>;

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  offset?: ColSpanType;
  order?: ColSpanType;
  pull?: ColSpanType;
  push?: ColSpanType;
  column: ColSpanType;
}

const displayName = 'Col';

const ColRoot = styled('div', {
  name: displayName,
  slot: 'Root',
})<{
  column?: number;
  offset?: number;
  push?: number;
  pull?: number;
  order?: number;
}>(({ theme, styleProps }) => {
  const { column, offset, push, pull, order } = styleProps;
  const { breakpoints } = theme;

  const columnStyle: CSSObject | boolean = column !== undefined && {
    display: column === 0 ? 'none' : undefined,
    minHeight: 1,
    width: `${(100 * column) / breakpoints.column}%`,
  };

  const offsetStyle: CSSObject | boolean = offset !== undefined && {
    marginLeft: `${(100 * offset) / breakpoints.column}%`,
  };

  const pushStyle: CSSObject | boolean = push !== undefined && {
    left: `${(100 * push) / breakpoints.column}%`,
  };

  const pullStyle: CSSObject | boolean = pull !== undefined && {
    right: `${(100 * pull) / breakpoints.column}%`,
  };

  const orderStyle: CSSObject | boolean = order !== undefined && {
    order,
  };

  return {
    float: 'left',
    boxSizing: 'border-box',
    display: 'block',
    position: 'relative',
    ...columnStyle,
    ...offsetStyle,
    ...pushStyle,
    ...pullStyle,
    ...orderStyle,
  };
});

const Col = React.forwardRef<HTMLDivElement, ColProps>((props, ref) => {
  const { children, className, offset, order, pull, push, column, style, ...others } = props;

  const { matches, gutter } = React.useContext(RowContext);
  const { clsPrefix } = React.useContext(ThemeContext);

  const computedColumn = React.useMemo(() => {
    if (typeof column === 'number') {
      return column;
    }
    if (typeof column === 'object') {
      for (let i = 0; i < matches.length; i++) {
        const breakPoint = matches[i];
        if (column[breakPoint] !== undefined) {
          return column[breakPoint] as number;
        }
      }
    }
  }, [column, matches]);

  const computedOffset = React.useMemo(() => {
    if (typeof offset === 'number') {
      return offset;
    }
    if (typeof offset === 'object') {
      for (let i = 0; i < matches.length; i++) {
        const breakPoint = matches[i];
        if (offset[breakPoint] !== undefined) {
          return offset[breakPoint] as number;
        }
      }
    }
  }, [offset, matches]);

  const computedPull = React.useMemo(() => {
    if (typeof pull === 'number') {
      return pull;
    }
    if (typeof pull === 'object') {
      for (let i = 0; i < matches.length; i++) {
        const breakPoint = matches[i];
        if (pull[breakPoint] !== undefined) {
          return pull[breakPoint] as number;
        }
      }
    }
  }, [pull, matches]);

  const computedPush = React.useMemo(() => {
    if (typeof push === 'number') {
      return push;
    }
    if (typeof push === 'object') {
      for (let i = 0; i < matches.length; i++) {
        const breakPoint = matches[i];
        if (push[breakPoint] !== undefined) {
          return push[breakPoint] as number;
        }
      }
    }
  }, [push, matches]);

  const computedOrder = React.useMemo(() => {
    if (typeof order === 'number') {
      return order;
    }
    if (typeof order === 'object') {
      for (let i = 0; i < matches.length; i++) {
        const breakPoint = matches[i];
        if (order[breakPoint] !== undefined) {
          return order[breakPoint] as number;
        }
      }
    }
  }, [order, matches]);

  const colStyle =
    gutter > 0
      ? {
          ...style,
          paddingLeft: gutter / 2,
          paddingRight: gutter / 2,
        }
      : style;

  const rootClassName = `${clsPrefix}-col`;

  const rootClasses = clsx(
    rootClassName,
    {
      [`${rootClassName}--column-${computedColumn}`]: computedColumn !== undefined,
      [`${rootClassName}--offset-${computedOffset}`]: computedOffset !== undefined,
      [`${rootClassName}--order-${computedOrder}`]: computedOrder !== undefined,
      [`${rootClassName}--pull-${computedPull}`]: computedPull !== undefined,
      [`${rootClassName}--push-${computedPush}`]: computedPush !== undefined,
    },
    className,
  );

  return (
    <ColRoot
      {...others}
      style={colStyle}
      className={rootClasses}
      styleProps={{
        column: computedColumn,
        offset: computedOffset,
        push: computedPush,
        pull: computedPull,
        order: computedOrder,
      }}
      ref={ref}
    >
      {children}
    </ColRoot>
  );
});

if (env.isDevelopment) {
  Col.displayName = displayName;

  Col.propTypes = {
    column: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.object.isRequired])
      .isRequired,
    offset: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.object.isRequired]),
    push: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.object.isRequired]),
    pull: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.object.isRequired]),
    order: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.object.isRequired]),
    className: PropTypes.string,
    children: PropTypes.node,
    style: PropTypes.object,
  };
}

export default Col;
