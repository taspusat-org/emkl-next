import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ImSpinner2 } from 'react-icons/im';
import { cn } from '@/lib/utils';
import { FaSave } from 'react-icons/fa';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
        success: 'bg-green-500 text-white shadow hover:bg-green-600',
        warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        save: 'bg-primary text-white hover:bg-primary/90' // add new "save" variant
      },
      size: {
        default: 'h-9 px-2 py-1',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

const loadingVariants = cva('flex items-center justify-center w-full h-full', {
  variants: {
    variant: {
      default: 'text-zinc-50',
      destructive: 'text-zinc-50',
      outline: 'text-black',
      secondary: 'text-primary',
      ghost: 'text-black',
      success: 'text-white',
      warning: 'text-white',
      link: 'text-primary',
      base: 'text-primary',
      cancel: 'text-[#898989]',
      save: 'text-primary'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading &&
            'pointer-events-none flex items-center text-sm disabled:text-transparent'
        )}
        disabled={props.disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className={cn(loadingVariants({ variant }))}>
            <ImSpinner2 className="mx-2 animate-spin" />
          </div>
        ) : (
          <>
            {variant === 'save' && <FaSave className="mr-1" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
