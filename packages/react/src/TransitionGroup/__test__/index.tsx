/* eslint-disable @typescript-eslint/no-unsafe-return */
import { mount } from 'enzyme';
import React from 'react';
import TransitionGroup from '..';
import * as TransitionUtils from '../../utils/transition';
import { voidFn } from '../../utils/function';

describe('TransitionGroup', () => {
  it('测试顺序是否正确', () => {
    const prevArr = [1, 2, 3, 4, 5];
    const nextArr = [2, 1, 4, 6, 5];
    const expectArr = [2, 1, 3, 4, 6, 5];
    const Comp = (props: { arr: Array<number> }) => {
      const { arr } = props;
      const children = arr.map((it) => <div key={it}>{it}</div>);
      return <TransitionGroup transitionClasses='demo'>{children}</TransitionGroup>;
    };
    const wrapper = mount(<Comp arr={prevArr} />);
    expect(wrapper.text()).toBe(prevArr.map((it) => it.toString()).reduce((a, b) => a + b));
    wrapper.setProps({ arr: nextArr });
    wrapper.update();

    expect(wrapper.text()).toBe(expectArr.map((it) => it.toString()).reduce((a, b) => a + b));
  });

  it('test hooks', () => {
    const nextFrameSpy = jest.spyOn(TransitionUtils, 'nextFrame');
    nextFrameSpy.mockImplementation((fn: () => void) => {
      fn();
      return voidFn;
    });

    const prevArr = [1];
    const nextArr = [2];
    const nextArr2 = [3];
    const fn = jest.fn();
    const Comp = (props: { arr: Array<number> }) => {
      const { arr } = props;
      const children = arr.map((it) => (
        // 阻止执行leave动作
        <div key={it}>{it}</div>
      ));
      return (
        <TransitionGroup
          beforeEnter={() => fn('beforeEnter')}
          enter={() => fn('enter')}
          afterEnter={() => fn('afterEnter')}
          beforeLeave={() => fn('beforeLeave')}
          leave={() => fn('leave')}
          afterLeave={() => fn('afterLeave')}
        >
          {children}
        </TransitionGroup>
      );
    };
    const wrapper = mount(<Comp arr={prevArr} />);
    expect(fn.mock.calls.length).toBe(0);
    wrapper.setProps({ arr: nextArr });
    expect(fn.mock.calls.length).toBe(6);
    wrapper.setProps({ arr: nextArr });
    expect(fn.mock.calls.length).toBe(6);

    wrapper.setProps({ arr: nextArr2 });
    expect(fn.mock.calls.length).toBe(6 * 2);
  });
});
