import { Slate, Editable, withReact, RenderElementProps } from 'slate-react';
import { createEditor, Descendant } from 'slate';
import { env } from '@xl-vision/utils';
import React from 'react';
import { withHistory } from 'slate-history';

import './types';

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
