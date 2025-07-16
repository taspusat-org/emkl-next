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
          'flex h-9 w-full rounded-sm border border-zinc-300 bg-transparent px-3 py-1 text-xs font-normal uppercase text-zinc-900 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:bg-[#ffffee] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          readOnly ? 'text-zinc-400' : '',
          'tracking-normal', // Add this class for normal letter spacing
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
