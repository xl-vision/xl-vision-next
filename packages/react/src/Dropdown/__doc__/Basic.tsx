/* eslint-disable no-console */
import { Button, Dropdown } from '@xl-vision/react';
import React from 'react';

export default () => {
  const menus = (
    <>
      <Dropdown.Item onClick={() => console.log(1)}>1st menu item</Dropdown.Item>
      <Dropdown.Item disabled={true} onClick={() => console.log(2)}>
        2nd menu item
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => console.log(3)}>3rd menu item</Dropdown.Item>
    </>
  );

  return (
    <Dropdown menus={menus}>
      <Button theme='primary'>button</Button>
    </Dropdown>
  );
};
