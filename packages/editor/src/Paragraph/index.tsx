import React from 'react';
import { Node, Element } from '../types';

const Paragraph: Node<'paragraph'> = {
  support(element) {
    return element.type === 'paragraph';
  },
  render() {
    return null;
  },
};

export default Paragraph;
