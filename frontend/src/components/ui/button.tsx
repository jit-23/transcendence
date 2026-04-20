import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-ink text-bg hover:opacity-90",
        outline: "border border-border bg-surface2 text-ink hover:bg-surface",
        ghost: "text-ink hover:bg-surface2",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.PropsWithChildren<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const { className, variant, size, asChild, children, ...rest } = props;
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(classes, children.props.className),
    });
  }

  return (
    <button className={classes} ref={ref} {...rest}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
