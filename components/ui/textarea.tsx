import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, readOnly, ...props }, ref) => {
    return (
      <textarea
        readOnly={readOnly}
        className={cn(
          'text-primary-text flex h-20 w-full rounded-sm border border-input-border bg-transparent px-3 py-1 text-xs font-normal uppercase shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-input-border focus:bg-background-input-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          readOnly ? 'text-zinc-400' : '',
          'tracking-normal', // Add this class for normal letter spacing
          className,
          // Add the conditional class for disabled background color
          props.disabled ? 'border-zinc-400 bg-gray-200' : '' // Set gray background for disabled state
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
