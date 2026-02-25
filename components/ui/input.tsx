import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, readOnly, ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete="off"
        readOnly={readOnly}
        className={cn(
          'flex h-9 w-full rounded-sm border border-input-border bg-background-input px-3 py-1 text-xs font-normal uppercase text-input-text shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-input-border-focus focus:bg-background-input-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'dark:placeholder:text-zinc-400',
          readOnly ? 'cursor-pointer text-input-text-disabled' : '',
          'tracking-normal',
          className,
          props.disabled ? 'bg-input-disabled' : ''
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
