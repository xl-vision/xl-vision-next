import { defaultLanguage } from '@xl-vision/react/locale';
import { mount } from 'enzyme';
import React from 'react';
import LocalizationContext from '../LocalizationContext';
import LocalizationProvider from '../LocalizationProvider';

describe('LocalizationProvider', () => {
  it('Get language', () => {
    const fn = jest.fn<any, Array<any>>();

    const Demo = () => {
      const { language, locale } = React.useContext(LocalizationContext);

      React.useEffect(() => {
        fn(language, locale);
      }, [language, locale]);

      return <div />;
    };

    const wrapper = mount(
      <LocalizationProvider language='en-US'>
        <Demo />
      </LocalizationProvider>,
    );

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe('en-US');

    fn.mockClear();

    wrapper.setProps({
      language: 'zh-CN',
    });

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe('zh-CN');
    fn.mockClear();

    wrapper.setProps({
      language: 'aaa',
    });

    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe(defaultLanguage);
  });
});
