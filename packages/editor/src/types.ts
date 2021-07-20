import { ReactEditor } from 'slate-react';
import { BaseEditor } from 'slate';
import { HistoryEditor } from 'slate-history';
import React from 'react';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type Element<T extends string = string> = {
  type: T;
};

export interface ParagraphElement extends Element<'paragraph'> {
  children: Array<CustomText>;
}

export interface HeadingElement extends Element<'heading'> {
  level: number;
  children: Array<CustomText>;
}

export type CustomElement = ParagraphElement | HeadingElement;

export type FormattedText = { text: string; bold?: true };

export type CustomText = FormattedText;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface Node<T extends string> {
  support(element: Element): element is Element<T>;
  render(element: Element<T>, attributes: any, children: any): React.ReactNode;
}
