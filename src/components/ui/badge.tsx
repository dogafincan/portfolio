import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-3xl border border-transparent px-2 py-0.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-focus-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive-border aria-invalid:ring-destructive-border [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-badge-neutral text-badge-neutral-foreground [a]:hover:bg-control-hover [a]:active:bg-control-active",
        secondary:
          "bg-badge-neutral text-badge-neutral-foreground [a]:hover:bg-control-hover [a]:active:bg-control-active",
        "header-info":
          "bg-badge-header-info text-badge-header-info-foreground [a]:hover:bg-badge-header-info-hover [a]:active:bg-badge-header-info-active",
        info: "bg-badge-info text-badge-info-foreground [a]:hover:bg-badge-info-hover [a]:active:bg-badge-info-active",
        success:
          "bg-badge-success text-badge-success-foreground [a]:hover:bg-badge-success-hover [a]:active:bg-badge-success-active",
        warning:
          "bg-badge-warning text-badge-warning-foreground [a]:hover:bg-badge-warning-hover [a]:active:bg-badge-warning-active",
        destructive:
          "bg-badge-destructive text-badge-destructive-foreground focus-visible:ring-destructive-border [a]:hover:bg-badge-destructive-hover [a]:active:bg-badge-destructive-active",
        "neutral-strong": "bg-badge-neutral-strong text-contrast-foreground",
        "info-strong": "bg-badge-info-strong text-contrast-foreground",
        "success-strong": "bg-badge-success-strong text-contrast-foreground",
        "warning-strong": "bg-badge-warning-strong text-badge-warning-strong-foreground",
        "destructive-strong":
          "bg-badge-destructive-strong text-contrast-foreground focus-visible:ring-destructive-border",
        outline:
          "border-border bg-muted text-foreground [a]:hover:bg-control-hover [a]:active:bg-control-active [a]:hover:text-muted-foreground",
        ghost:
          "bg-muted hover:bg-control-hover active:bg-control-active hover:text-muted-foreground",
        link: "bg-badge-info text-info-foreground underline-offset-4 hover:bg-badge-info-hover active:bg-badge-info-active hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
