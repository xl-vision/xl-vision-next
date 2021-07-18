declare module '*.md';
declare module '*.css';

declare module '*.mdx' {
  const MDXComponent: React.ComponentType<any>;
  export default MDXComponent;
}

declare module '@mdx-js/react' {
  import * as React from 'react';

  type ComponentType =
    | 'a'
    | 'blockquote'
    | 'code'
    | 'del'
    | 'em'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'hr'
    | 'img'
    | 'inlineCode'
    | 'li'
    | 'ol'
    | 'p'
    | 'pre'
    | 'strong'
    | 'sup'
    | 'table'
    | 'td'
    | 'thematicBreak'
    | 'tr'
    | 'ul'
    | 'wrapper'
    | 'DemoBox';

  export type Components = {
    [key in ComponentType]?: React.ComponentType<any>;
  };
  export interface MDXProviderProps {
    children: React.ReactNode;
    components: Components;
  }
  // eslint-disable-next-line react/prefer-stateless-function
  export class MDXProvider extends React.Component<MDXProviderProps> {}
}

declare module '*.jpg';
