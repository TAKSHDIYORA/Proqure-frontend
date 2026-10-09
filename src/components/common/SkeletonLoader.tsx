import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "table-row" | "card";
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  count = 1,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "table-row") {
    return (
      <>
        {items.map((key) => (
          <tr key={key} className="border-b border-white/[0.04] animate-pulse">
            <td className="px-5 py-4">
              <div className="h-3.5 bg-[#171C24] rounded w-28 mb-1.5" />
              <div className="h-2.5 bg-[#13171F] rounded w-16" />
            </td>
            <td className="px-5 py-4">
              <div className="h-3.5 bg-[#171C24] rounded w-24" />
            </td>
            <td className="px-5 py-4">
              <div className="h-4 bg-[#171C24] rounded-md w-16" />
            </td>
            <td className="px-5 py-4 text-right">
              <div className="h-3.5 bg-[#171C24] rounded w-14 ml-auto" />
            </td>
            <td className="px-5 py-4 text-center">
              <div className="h-4 bg-[#171C24] rounded-md w-18 mx-auto" />
            </td>
            <td className="px-5 py-4 text-right">
              <div className="h-3.5 bg-[#171C24] rounded w-16 ml-auto" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((key) => (
          <div
            key={key}
            className="bg-[#11151C] border border-white/[0.06] rounded-xl p-5 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-3 bg-[#171C24] rounded w-20" />
              <div className="w-8 h-8 rounded-lg bg-[#171C24]" />
            </div>
            <div className="h-7 bg-[#171C24] rounded w-28 mb-3" />
            <div className="h-2.5 bg-[#171C24] rounded w-36" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((key) => (
        <div
          key={key}
          className={`animate-pulse bg-[#171C24] rounded ${
            variant === "circular"
              ? "rounded-full"
              : variant === "text"
              ? "h-3 my-1"
              : "h-8"
          } ${className}`}
        />
      ))}
    </>
  );
};
