import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type OrderStatus = "pending" | "production" | "shipped" | "delivered";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-status-pending-bg text-status-pending border-status-pending/20",
  },
  production: {
    label: "In Production",
    className: "bg-status-production-bg text-status-production border-status-production/20",
  },
  shipped: {
    label: "Shipped",
    className: "bg-status-shipped-bg text-status-shipped border-status-shipped/20",
  },
  delivered: {
    label: "Delivered",
    className: "bg-status-delivered-bg text-status-delivered border-status-delivered/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}