import PropTypes from 'prop-types';
import React from 'react';
import { env } from '@xl-vision/utils';
import CSSTransition, { CSSTransitionClassesObject, CSSTransitionProps } from '../CSSTransition';
import useLayoutEffect from '../hooks/useLayoutEffect';
import { AfterEventHook } from '../Transition';
import { omit } from '../utils/function';
import warning from '../utils/warning';
import diff, { DiffData } from './diff';

export interface TransitionGroupClassesObject
  extends Omit<
    CSSTransitionClassesObject,
    'appearFrom' | 'appearActive' | 'appearTo' | 'disappearFrom' | 'disappearActive' | 'disappearTo'
  > {
  move?: string;
}

export type TransitionGroupClasses = string | TransitionGroupClassesObject;

export interface TransitionGroupProps
  extends Omit<
    CSSTransitionProps,
    'children' | 'transitionOnFirst' | 'in' | 'classNames' | 'mountOnEnter' | 'unmountOnLeave'
  > {
  children: Array<CSSTransitionProps['children']>;
  transitionClasses?: TransitionGroupClasses;
}

const TransitionGroup: React.FunctionComponent<TransitionGroupProps> = (props) => {
  const { children, transitionClasses, afterLeave, ..._others } = props;

  // 阻止用户故意传入appear和disappear钩子
  const others = omit(_others as CSSTransitionProps, 'in');

  const transitionClassesObj = React.useMemo(() => {
    let obj: CSSTransitionClassesObject = {};

    if (!transitionClasses) {
      return {};
    }
    // 组件实际上是使用CSSTransition的appear和disappear钩子实现动画，但是向用户隐藏实现细节，
    // 所以这里需要将enter和leave的class设置到appear和disappear上
    if (typeof transitionClasses === 'object') {
      obj = { ...transitionClasses };
      obj.appearFrom = obj.enterFrom;
      obj.appearActive = obj.enterActive;
      obj.appearTo = obj.enterTo;

      obj.disappearFrom = obj.leaveFrom;
      obj.disappearActive = obj.leaveActive;
      obj.disappearTo = obj.leaveTo;
    } else {
      obj.appearFrom = obj.enterFrom = `${transitionClasses}-enter-from`;
      obj.appearTo = obj.enterTo = `${transitionClasses}-enter-to`;
      obj.appearActive = obj.enterActive = `${transitionClasses}-enter-active`;
      obj.disappearFrom = obj.leaveFrom = `${transitionClasses}-leave-from`;
      obj.disappearTo = obj.leaveTo = `${transitionClasses}-leave-to`;
      obj.disappearActive = obj.leaveActive = `${transitionClasses}-leave-active`;
    }

    return obj;
  }, [transitionClasses]);

  const prevChildrenRef = React.useRef<Array<React.ReactElement>>();

  const [diffArray, setDiffArray] = React.useState<Array<DiffData>>([]);

  const callAfterLeave = React.useCallback(
    (key: React.Key | null) => {
      warning(!key, `<TransitioGroup> must has a key`);
      const hook: AfterEventHook = (e, transitionOnFirst) => {
        afterLeave?.(e, transitionOnFirst);
        prevChildrenRef.current = prevChildrenRef.current?.filter((it) => it.key !== key);
      };

      return hook;
    },
    [afterLeave],
  );

  useLayoutEffect(() => {
    const prevChildren = prevChildrenRef.current;
    const array = prevChildren
      ? diff(prevChildren, children)
      : React.Children.map(children, (it) => ({ prev: [it], next: [it], same: true }));

    setDiffArray(array);

    const nodes: Array<React.ReactElement> = [];
    array.forEach((it) => {
      if (it.same) {
        nodes.push(...it.next);
      } else {
        nodes.push(...it.prev, ...it.next);
      }
    });

    prevChildrenRef.current = nodes;
  }, [children]);

  const nodes: Array<React.ReactElement<CSSTransitionProps>> = [];
  diffArray.forEach((it) => {
    if (it.same) {
      const array = it.next.map((item) => {
        return (
          <CSSTransition
            {...others}
            key={item.key}
            in={true}
            transitionClasses={transitionClassesObj}
            mountOnEnter={true}
            unmountOnLeave={true}
          >
            {item}
          </CSSTransition>
        );
      });
      nodes.push(...array);
    } else {
      const prev = it.prev.map((item) => {
        return (
          <CSSTransition
            {...others}
            key={item.key}
            in={false}
            transitionOnFirst={true}
            mountOnEnter={true}
            unmountOnLeave={true}
            transitionClasses={transitionClassesObj}
            afterLeave={callAfterLeave(item.key)}
          >
            {item}
          </CSSTransition>
        );
      });

      const next = it.next.map((item) => {
        return (
          <CSSTransition
            {...others}
            key={item.key}
            in={true}
            transitionOnFirst={true}
            mountOnEnter={true}
            unmountOnLeave={true}
            transitionClasses={transitionClassesObj}
          >
            {item}
          </CSSTransition>
        );
      });

      nodes.push(...prev, ...next);
    }
  });

  return <>{nodes}</>;
};

if (env.isDevelopment) {
  TransitionGroup.displayName = 'TransitionGroup';

  TransitionGroup.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element.isRequired).isRequired,
    transitionClasses: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    afterLeave: PropTypes.func,
  };
}

export default TransitionGroup;
