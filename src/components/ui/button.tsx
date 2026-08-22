import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button-target group/button inline-flex shrink-0 items-center justify-center rounded-4xl border bg-clip-padding text-base leading-6 font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-focus-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive-border aria-invalid:ring-3 aria-invalid:ring-destructive-border [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        outline:
          "border-border bg-transparent text-foreground hover:bg-control-hover hover:text-foreground active:bg-control-active aria-expanded:bg-control-hover aria-expanded:text-foreground aria-pressed:bg-control-active",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-control-active aria-expanded:bg-accent aria-expanded:text-secondary-foreground",
        ghost:
          "border-transparent hover:bg-control-hover active:bg-control-active hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground dark:hover:bg-control-hover",
        "info-muted":
          "border-info-border bg-info text-info-foreground hover:bg-info-hover active:bg-info-active aria-expanded:bg-info-hover aria-expanded:text-info-foreground",
        warning:
          "border-transparent bg-warning-strong text-warning-strong-foreground hover:bg-warning-strong-hover active:bg-warning-strong-active focus-visible:border-warning-border focus-visible:ring-warning-border",
        "warning-muted":
          "border-warning-border bg-warning text-warning-foreground hover:bg-warning-hover active:bg-warning-active aria-expanded:bg-warning-hover aria-expanded:text-warning-foreground focus-visible:border-warning-border focus-visible:ring-warning-border",
        destructive:
          "border-transparent bg-destructive-strong text-destructive-strong-foreground hover:bg-destructive-strong-hover active:bg-destructive-strong-active focus-visible:border-destructive-border focus-visible:ring-destructive-border",
        "destructive-muted":
          "border-destructive-border bg-destructive-surface text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active aria-expanded:bg-destructive-hover aria-expanded:text-destructive-foreground focus-visible:border-destructive-border focus-visible:ring-destructive-border",
        success:
          "border-transparent bg-success-strong text-success-strong-foreground hover:bg-success-strong-hover active:bg-success-strong-active focus-visible:border-success-border focus-visible:ring-success-border",
        link: "border-transparent text-info-foreground underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-9 gap-1 px-2.5 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-3 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-9 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
