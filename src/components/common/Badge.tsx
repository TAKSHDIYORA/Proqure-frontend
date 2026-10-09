import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "primary";

interface BadgeProps {
  status?: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  size?: "sm" | "md";
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  className = "",
  dot = true,
  size = "md",
  children,
}) => {
  const key = (status || "").toUpperCase();

  // Determine semantic color variant based on explicit variant or status key
  let resolvedVariant: BadgeVariant = "default";

  if (variant) {
    resolvedVariant = variant;
  } else if (key) {
    switch (key) {
      case "ACTIVE":
      case "ACCEPTED":
      case "FINALIZED":
      case "DELIVERED":
      case "APPROVED":
      case "AWARDED":
      case "PAID":
      case "NORMAL":
      case "COMPLETED":
      case "CONNECTED":
        resolvedVariant = "success";
        break;

      case "INACTIVE":
      case "CANCELLED":
      case "REJECTED":
      case "OUT_OF_STOCK":
      case "BLOCKED":
      case "FAILED":
      case "OVERDUE":
        resolvedVariant = "danger";
        break;

      case "PENDING":
      case "PENDING_APPROVAL":
      case "UNDER_REVIEW":
      case "LOW_STOCK":
      case "PARTIAL":
      case "IN_REVIEW":
        resolvedVariant = "warning";
        break;

      case "SHIPPED":
      case "IN_PRODUCTION":
      case "ISSUED":
      case "OPEN":
      case "SUBMITTED":
      case "IN_TRANSIT":
      case "INVITED":
        resolvedVariant = "info";
        break;

      case "DRAFT":
      case "CLOSED":
      case "ARCHIVED":
      default:
        resolvedVariant = "default";
        break;
    }
  }

  // Styles map using controlled dark surface tinting and readable text contrast
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    success: {
      container: "bg-[#4ADE80]/[0.08] text-[#4ADE80] border-[#4ADE80]/20",
      dot: "bg-[#4ADE80]",
    },
    warning: {
      container: "bg-[#F5C76A]/[0.08] text-[#F5C76A] border-[#F5C76A]/20",
      dot: "bg-[#F5C76A]",
    },
    danger: {
      container: "bg-[#F87171]/[0.08] text-[#F87171] border-[#F87171]/20",
      dot: "bg-[#F87171]",
    },
    info: {
      container: "bg-[#60A5FA]/[0.08] text-[#60A5FA] border-[#60A5FA]/20",
      dot: "bg-[#60A5FA]",
    },
    primary: {
      container: "bg-[#7C83FF]/[0.08] text-[#7C83FF] border-[#7C83FF]/20",
      dot: "bg-[#7C83FF]",
    },
    default: {
      container: "bg-[#171C24] text-[#9AA3AE] border-white/[0.08]",
      dot: "bg-[#697381]",
    },
  };

  const style = variantStyles[resolvedVariant];
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";

  // Format label for display if using status string (e.g. PENDING_APPROVAL -> Pending Approval)
  const formatLabel = (txt?: string) => {
    if (!txt) return "";
    return txt
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-tight transition-colors ${sizeClasses} ${style.container} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children || formatLabel(status)}</span>
    </span>
  );
};
