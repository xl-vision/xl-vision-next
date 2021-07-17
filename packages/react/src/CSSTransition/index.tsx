import PropTypes from 'prop-types';
import React from 'react';
import { env } from '@xl-vision/utils';
import { addClass, removeClass } from '../utils/class';
import { nextFrame, onTransitionEnd } from '../utils/transition';
import Transition, {
  AfterEventHook,
  BeforeEventHook,
  EventCancelledHook,
  EventHook,
  TransitionProps,
} from '../Transition';
import useEventCallback from '../hooks/useEventCallback';

export type CSSTransitionClassesObject = {
  appearFrom?: string;
  appearActive?: string;
  appearTo?: string;
  enterFrom?: string;
  enterActive?: string;
  enterTo?: string;
  leaveFrom?: string;
  leaveActive?: string;
  leaveTo?: string;
  disappearFrom?: string;
  disappearActive?: string;
  disappearTo?: string;
};

export type CSSTransitionClasses = CSSTransitionClassesObject | string;

export type CSSTransitionProps = TransitionProps & {
  disableCss?: boolean;
  transitionClasses?: CSSTransitionClasses;
  timeout?:
    | number
    | {
        appear?: number;
        enter?: number;
        leave?: number;
        disappear?: number;
      };
};

export type CSSTransitionElement = HTMLElement & {
  _ctc?: CSSTransitionClassesObject;
};

const CSSTransition: React.FunctionComponent<CSSTransitionProps> = (props) => {
  const {
    disableCss,
    transitionClasses,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled,
    beforeLeave,
    leave,
    afterLeave,
    leaveCancelled,
    timeout,
    ...others
  } = props;

  const transitionClassesObject: CSSTransitionClassesObject = React.useMemo(() => {
    if (!transitionClasses) {
      return {};
    }
    if (typeof transitionClasses === 'object') {
      return transitionClasses;
    }
    return {
      appearFrom: `${transitionClasses}-appear-from`,
      appearActive: `${transitionClasses}-appear-active`,
      appearTo: `${transitionClasses}-appear-to`,
      enterFrom: `${transitionClasses}-enter-from`,
      enterActive: `${transitionClasses}-enter-active`,
      enterTo: `${transitionClasses}-enter-to`,
      leaveFrom: `${transitionClasses}-leave-from`,
      leaveActive: `${transitionClasses}-leave-active`,
      leaveTo: `${transitionClasses}-leave-to`,
      disappearFrom: `${transitionClasses}-disappear-from`,
      disappearActive: `${transitionClasses}-disappear-active`,
      disappearTo: `${transitionClasses}-disappear-to`,
    };
  }, [transitionClasses]);

  const timeoutObject = React.useMemo(() => {
    if (!timeout) {
      return {};
    }
    if (typeof timeout === 'object') {
      return timeout;
    }
    return {
      appear: timeout,
      enter: timeout,
      leave: timeout,
      disappear: timeout,
    };
  }, [timeout]);

  const beforeEnterWrapper: BeforeEventHook = useEventCallback(
    (el: CSSTransitionElement, transitionOnFirst) => {
      if (!disableCss) {
        if (transitionOnFirst) {
          addClass(el, transitionClassesObject.appearFrom || '');
          addClass(el, transitionClassesObject.appearActive || '');
          el._ctc = {
            appearFrom: transitionClassesObject.appearFrom,
            appearActive: transitionClassesObject.appearActive,
          };
        } else {
          addClass(el, transitionClassesObject.enterFrom || '');
          addClass(el, transitionClassesObject.enterActive || '');
          el._ctc = {
            enterFrom: transitionClassesObject.enterFrom,
            enterActive: transitionClassesObject.enterActive,
          };
        }
      }
      beforeEnter?.(el, transitionOnFirst);
    },
  );

  const enterWrapper: EventHook = useEventCallback(
    (el: CSSTransitionElement, done, isCancelled, transitionOnFirst) => {
      nextFrame(() => {
        if (!isCancelled()) {
          if (!disableCss) {
            if (transitionOnFirst) {
              addClass(el, transitionClassesObject.appearTo || '');
              removeClass(el, el._ctc?.appearFrom || '');
              el._ctc = {
                appearActive: el._ctc?.appearActive,
                appearTo: transitionClassesObject.appearTo,
              };
            } else {
              addClass(el, transitionClassesObject.enterTo || '');
              removeClass(el, el._ctc?.enterFrom || '');
              el._ctc = {
                enterActive: el._ctc?.enterActive,
                enterTo: transitionClassesObject.enterTo,
              };
            }
          }
          const duration = transitionOnFirst ? timeoutObject.appear : timeoutObject.enter;

          if (duration && duration > 0) {
            setTimeout(done, duration);
          } else if (!disableCss) {
            onTransitionEnd(el, done);
          }
        }
      });
      enter?.(el, done, isCancelled, transitionOnFirst);
    },
  );
  const afterEnterWrapper: AfterEventHook = useEventCallback(
    (el: CSSTransitionElement, transitionOnFirst) => {
      if (!disableCss) {
        if (transitionOnFirst) {
          removeClass(el, el._ctc?.appearActive || '');
          removeClass(el, el._ctc?.appearTo || '');
        } else {
          removeClass(el, el._ctc?.enterActive || '');
          removeClass(el, el._ctc?.enterTo || '');
        }
        el._ctc = undefined;
      }
      afterEnter?.(el, transitionOnFirst);
    },
  );
  const enterCancelledWrapper: EventCancelledHook = useEventCallback(
    (el: CSSTransitionElement, transitionOnFirst) => {
      if (!disableCss) {
        if (transitionOnFirst) {
          removeClass(el, el._ctc?.appearActive || '');
          removeClass(el, el._ctc?.appearTo || '');
          removeClass(el, el._ctc?.appearFrom || '');
        } else {
          removeClass(el, el._ctc?.enterActive || '');
          removeClass(el, el._ctc?.enterTo || '');
          removeClass(el, el._ctc?.enterFrom || '');
        }
        el._ctc = undefined;
      }
      enterCancelled?.(el, transitionOnFirst);
    },
  );

  const beforeLeaveWrapper: BeforeEventHook = useEventCallback(
    (el: CSSTransitionElement, transitionOnFirst) => {
      if (!disableCss) {
        if (transitionOnFirst) {
          addClass(el, transitionClassesObject.disappearFrom || '');
          addClass(el, transitionClassesObject.disappearActive || '');
          el._ctc = {
            disappearFrom: transitionClassesObject.disappearFrom,
            disappearActive: transitionClassesObject.disappearActive,
          };
        } else {
          addClass(el, transitionClassesObject.leaveFrom || '');
          addClass(el, transitionClassesObject.leaveActive || '');
          el._ctc = {
            leaveFrom: transitionClassesObject.leaveFrom,
            leaveActive: transitionClassesObject.leaveActive,
          };
        }
      }
      beforeLeave?.(el, transitionOnFirst);
    },
  );

  const leaveWrapper: EventHook = useEventCallback(
    (el: CSSTransitionElement, done, isCancelled, transitionOnFirst) => {
      nextFrame(() => {
        if (!isCancelled()) {
          if (!disableCss) {
            if (transitionOnFirst) {
              removeClass(el, el._ctc?.disappearFrom || '');
              addClass(el, transitionClassesObject.disappearTo || '');
              el._ctc = {
                disappearFrom: el._ctc?.disappearFrom,
                disappearTo: transitionClassesObject.disappearTo,
              };
            } else {
              removeClass(el, el._ctc?.leaveFrom || '');
              addClass(el, transitionClassesObject.leaveTo || '');
              el._ctc = {
                leaveActive: el._ctc?.leaveActive,
                leaveTo: transitionClassesObject.leaveTo,
              };
            }
          }
          const duration = transitionOnFirst ? timeoutObject.disappear : timeoutObject.leave;

          if (duration && duration > 0) {
            setTimeout(done, duration);
          } else if (!disableCss) {
            onTransitionEnd(el, done);
          }
        }
      });
      leave?.(el, done, isCancelled, transitionOnFirst);
    },
  );
  const afterLeaveWrapper: AfterEventHook = useEventCallback(
    (el: CSSTransitionElement, transitionOnFirst) => {
      if (!disableCss) {
        if (transitionOnFirst) {
          removeClass(el, el._ctc?.disappearActive || '');
          removeClass(el, el._ctc?.disappearTo || '');
        } else {
          removeClass(el, el._ctc?.leaveActive || '');
          removeClass(el, el._ctc?.leaveTo || '');
        }
        el._ctc = undefined;
      }
      afterLeave?.(el, transitionOnFirst);
    },
  );
  const leaveCancelledWrapper: EventCancelledHook = useEventCallback(
    (el: CSSTransitionElement, transitionOnFirst) => {
      if (!disableCss) {
        if (transitionOnFirst) {
          removeClass(el, el._ctc?.disappearActive || '');
          removeClass(el, el._ctc?.disappearTo || '');
          removeClass(el, el._ctc?.disappearFrom || '');
        } else {
          removeClass(el, el._ctc?.leaveActive || '');
          removeClass(el, el._ctc?.leaveTo || '');
          removeClass(el, el._ctc?.leaveFrom || '');
        }
        el._ctc = undefined;
      }
      leaveCancelled?.(el, transitionOnFirst);
    },
  );

  return (
    <Transition
      {...others}
      beforeEnter={beforeEnterWrapper}
      enter={enterWrapper}
      afterEnter={afterEnterWrapper}
      enterCancelled={enterCancelledWrapper}
      beforeLeave={beforeLeaveWrapper}
      leave={leaveWrapper}
      afterLeave={afterLeaveWrapper}
      leaveCancelled={leaveCancelledWrapper}
    />
  );
};

if (env.isDevelopment) {
  CSSTransition.displayName = 'CSSTransition';

  CSSTransition.propTypes = {
    transitionClasses: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    disableCss: PropTypes.bool,
    beforeEnter: PropTypes.func,
    enter: PropTypes.func,
    afterEnter: PropTypes.func,
    enterCancelled: PropTypes.func,
    beforeLeave: PropTypes.func,
    leave: PropTypes.func,
    afterLeave: PropTypes.func,
    leaveCancelled: PropTypes.func,
  };
}

export default CSSTransition;
