import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { createEditor, Descendant } from 'slate';
import { env } from '@xl-vision/utils';
import React from 'react';

export type EditorProps = {};

const Editor: React.FunctionComponent<EditorProps> = (props) => {
  const { ...others } = props;
  const [value, setValue] = React.useState<Array<Descendant>>([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ]);

  const editor = React.useMemo(() => withReact(createEditor()), []);

  // Render the Slate context.
  return (
    <Slate {...others} editor={editor} value={value} onChange={(newValue) => setValue(newValue)}>
      <Editable />
    </Slate>
  );
};

if (env.isDevelopment) {
  Editor.displayName = 'Editor';
  Editor.defaultProps = {};
}

export default Editor;
