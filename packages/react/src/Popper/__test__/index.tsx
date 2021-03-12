import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import Popper from '..';
import wait from '../../../../../test/wait';

describe('Popper', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('test trigger hover', async () => {
    const handleVisibleChange = jest.fn();

    const wrapper = mount(
      <Popper
        trigger='hover'
        popup={<div>popup</div>}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => document.body}
      >
        <button id='btn'>button</button>
      </Popper>,
    );

    expect(wrapper.render()).toMatchSnapshot();

    wrapper.find('#btn').simulate('mouseenter');

    await act(() => wait(300));

    expect(handleVisibleChange).toHaveBeenLastCalledWith(true);
    expect(wrapper.render()).toMatchSnapshot();

    wrapper.find('#btn').simulate('mouseleave');

    await act(() => wait(300));

    expect(handleVisibleChange).toHaveBeenLastCalledWith(false);
    expect(wrapper.render()).toMatchSnapshot();
  });
  it('test trigger click', async () => {
    const handleVisibleChange = jest.fn();

    const wrapper = mount(
      <Popper
        trigger='click'
        popup={<div>popup</div>}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => document.body}
      >
        <button id='btn'>button</button>
      </Popper>,
    );

    expect(wrapper.render()).toMatchSnapshot();

    wrapper.find('#btn').simulate('click');

    await act(() => wait(300));

    expect(handleVisibleChange).toHaveBeenLastCalledWith(true);
    expect(wrapper.render()).toMatchSnapshot();

    document.body.click();

    await act(() => wait(300));

    expect(handleVisibleChange).toHaveBeenLastCalledWith(false);
    expect(wrapper.render()).toMatchSnapshot();
  });
  it('test trigger contextMenu', async () => {
    const handleVisibleChange = jest.fn();

    const wrapper = mount(
      <Popper
        trigger='contextMenu'
        popup={<div>popup</div>}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => document.body}
      >
        <button id='btn'>button</button>
      </Popper>,
    );

    expect(wrapper.render()).toMatchSnapshot();

    wrapper.find('#btn').simulate('contextMenu');

    await act(() => wait(300));

    expect(handleVisibleChange).toHaveBeenLastCalledWith(true);
    expect(wrapper.render()).toMatchSnapshot();

    document.body.click();

    await act(() => wait(300));

    expect(handleVisibleChange).toHaveBeenLastCalledWith(false);
    expect(wrapper.render()).toMatchSnapshot();
  });
  it('test trigger custom', async () => {
    // 外部修改不触发visibleChange
    const handleVisibleChange = jest.fn();

    const wrapper = mount(
      <Popper
        trigger='custom'
        popup={<div id='popup'>popup</div>}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => document.body}
        visible={false}
      >
        <button id='btn'>button</button>
      </Popper>,
    );
    expect(handleVisibleChange.mock.calls.length).toBe(0);
    expect(document.querySelector('#popup')).toBeNull();

    wrapper.find('#btn').simulate('mouseenter');

    await act(() => wait(300));

    expect(handleVisibleChange.mock.calls.length).toBe(0);
    expect(document.querySelector('#popup')).toBeNull();

    wrapper.setProps({
      visible: true,
    });

    await act(() => wait(300));

    expect(handleVisibleChange.mock.calls.length).toBe(0);
    let el = document.querySelector('#popup')!.parentElement!;
    expect(el).not.toBeNull();
    expect(el.style.display).toBe('');

    wrapper.setProps({
      visible: false,
    });
    await act(() => wait(300));
    expect(handleVisibleChange.mock.calls.length).toBe(0);
    el = document.querySelector('#popup')!.parentElement!;
    expect(el).not.toBeNull();
    expect(el.style.display).toBe('none');
  });
  it('test prop disablePopupEnter', async () => {
    const handleVisibleChange = jest.fn();
    const wrapper = mount(
      <Popper
        trigger='hover'
        className='popup'
        popup={<div>popup</div>}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => document.body}
      >
        <button id='btn'>button</button>
      </Popper>,
    );

    wrapper.find('#btn').simulate('mouseenter');

    await act(() => wait(300));
    expect(handleVisibleChange).toHaveBeenLastCalledWith(true);

    wrapper.find('#btn').simulate('mouseleave');

    wrapper.find('div.popup').simulate('mouseenter');

    await act(() => wait(300));
    expect(handleVisibleChange).toHaveBeenLastCalledWith(true);

    wrapper.find('div.popup').simulate('mouseleave');
    await act(() => wait(300));
    expect(handleVisibleChange).toHaveBeenLastCalledWith(false);

    wrapper.setProps({
      disablePopupEnter: true,
    });

    wrapper.find('#btn').simulate('mouseenter');

    await act(() => wait(300));
    expect(handleVisibleChange).toHaveBeenLastCalledWith(true);

    wrapper.find('#btn').simulate('mouseleave');
    wrapper.find('div.popup').simulate('mouseenter');

    await act(() => wait(300));
    expect(handleVisibleChange).toHaveBeenLastCalledWith(false);
  });
});
