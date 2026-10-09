import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`py-12 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#171C24] border border-white/[0.08] flex items-center justify-center text-[#697381] mb-3.5 shadow-sm">
        <Icon className="w-5 h-5 text-[#9AA3AE]" />
      </div>
      <h3 className="text-sm font-semibold text-[#E6E8EB] tracking-tight">{title}</h3>
      <p className="text-xs text-[#9AA3AE] mt-1.5 leading-relaxed max-w-xs">{description}</p>
      {action && (
        <div className="mt-4">
          {action.onClick ? (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
            >
              {action.label}
            </button>
          ) : action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
            >
              {action.label}
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
};
