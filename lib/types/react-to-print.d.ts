declare module 'react-to-print' {
  import * as React from 'react';

  export interface ReactToPrintProps {
    trigger: () => React.ReactElement;
    content: () => React.RefObject<HTMLElement> | HTMLElement | null;
    copyStyles?: boolean;
    documentTitle?: string;
    onBeforePrint?: () => void;
    onAfterPrint?: () => void;
  }

  export default class ReactToPrint extends React.Component<ReactToPrintProps> {}
}
