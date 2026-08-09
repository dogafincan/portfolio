import type { ComponentProps, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type StatusAlertTone = "destructive" | "info" | "success" | "warning";

const STATUS_ALERT_ICONS = {
  destructive: CircleAlert,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
} satisfies Record<StatusAlertTone, LucideIcon>;

export function StatusAlert({
  className,
  description,
  iconName,
  live = "assertive",
  shimmerContent = false,
  title,
  tone = "info",
  ...props
}: Omit<ComponentProps<typeof Alert>, "children" | "role" | "variant"> & {
  description: ReactNode;
  iconName?: string;
  live?: "assertive" | "polite";
  shimmerContent?: boolean;
  title: ReactNode;
  tone?: StatusAlertTone;
}) {
  const Icon = STATUS_ALERT_ICONS[tone];
  const liveRegionProps =
    live === "polite"
      ? ({ "aria-atomic": "true", "aria-live": "polite", role: "status" } as const)
      : ({} as const);

  return (
    <Alert
      {...props}
      {...liveRegionProps}
      className={cn(
        "animate-in fade-in slide-in-from-top-1 duration-[var(--ds-motion-duration-fast)] ease-[var(--ds-motion-ease-standard)] motion-reduce:animate-none",
        className,
      )}
      variant={tone}
    >
      {shimmerContent ? (
        <Spinner
          aria-hidden="true"
          aria-label={undefined}
          className="motion-reduce:animate-none"
          data-lucide={iconName}
          role={undefined}
        />
      ) : (
        <Icon aria-hidden="true" data-lucide={iconName} />
      )}
      <AlertTitle>
        <span
          className={cn(
            "inline-block",
            shimmerContent && "supports-[color:oklch(from_white_l_c_h)]:shimmer",
          )}
          data-slot="status-alert-title-content"
        >
          {title}
        </span>
      </AlertTitle>
      <AlertDescription>
        <span className="inline-block" data-slot="status-alert-description-content">
          {description}
        </span>
      </AlertDescription>
    </Alert>
  );
}
