import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { dojiTypography } from "@/lib/doji-ui";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-2xl border border-transparent px-4 py-3 text-left text-base has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-[3px] *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-info text-info-foreground *:data-[slot=alert-description]:text-info-foreground",
        destructive:
          "bg-destructive-surface text-destructive-foreground *:data-[slot=alert-description]:text-destructive-foreground",
        info: "bg-info text-info-foreground *:data-[slot=alert-description]:text-info-foreground",
        success:
          "bg-success text-success-foreground *:data-[slot=alert-description]:text-success-foreground",
        warning:
          "bg-warning text-warning-foreground *:data-[slot=alert-description]:text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-current",
        dojiTypography.uiTitle,
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-left text-pretty text-muted-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-current [&_p:not(:last-child)]:mb-4",
        dojiTypography.supporting,
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
