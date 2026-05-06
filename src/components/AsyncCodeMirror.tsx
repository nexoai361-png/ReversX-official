import React from 'react';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';

export default function CodeMirrorWrapper(props: ReactCodeMirrorProps) {
  return <CodeMirror {...props} />;
}
