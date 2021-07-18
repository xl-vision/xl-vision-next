import { Slate, Editable, withReact, ReactEditor, RenderElementProps } from 'slate-react';
import { createEditor, Descendant, BaseEditor } from 'slate';
import { env } from '@xl-vision/utils';
import React from 'react';
import { withHistory, HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

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

export type EditorProps = {};

const initialValue: Array<Descendant> = [
  {
    type: 'paragraph',
    children: [{ text: 'This is editable plain text, just like a <textarea>!' }],
  },
];

const Editor: React.FunctionComponent<EditorProps> = () => {
  const [value, setValue] = React.useState<Array<Descendant>>(initialValue);

  const editor = React.useMemo(() => withReact(withHistory(createEditor())), []);

  const renderElement = React.useCallback((props: RenderElementProps) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      default: {
        return <p {...attributes}>{children}</p>;
      }
    }
  }, []);

  return (
    <Slate editor={editor} value={value} onChange={(_value) => setValue(_value)}>
      <Editable renderElement={renderElement} placeholder='Enter some plain text...' />
    </Slate>
  );
};

if (env.isDevelopment) {
  Editor.displayName = 'Editor';
  Editor.defaultProps = {};
}

export default Editor;
