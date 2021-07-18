import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomEditor = BaseEditor & ReactEditor;

export type ParagraphElement = {
  type: 'paragraph';
  children: Array<CustomText>;
};

export type HeadingElement = {
  type: 'heading';
  level: number;
  children: Array<CustomText>;
};

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
