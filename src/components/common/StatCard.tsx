import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: number; // percentage change e.g. 12.4 or -3.2
  changePeriod?: string;
  icon?: LucideIcon;
  sparklineData?: number[];
  href?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  change,
  changePeriod = "vs last month",
  icon: Icon,
  sparklineData = [35, 45, 30, 60, 55, 75, 70, 90],
  className = "",
}) => {
  const isPositive = change !== undefined ? change > 0 : null;
  const isNeutral = change !== undefined ? change === 0 : null;

  return (
    <div
      className={`bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Top Header: Label & Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-[#9AA3AE] uppercase tracking-wider">
            {label}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[#171C24] border border-white/[0.06] flex items-center justify-center text-[#9AA3AE] group-hover:text-[#7C83FF] group-hover:border-[#7C83FF]/30 transition-colors">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <div className="text-2xl sm:text-3xl font-bold text-[#E6E8EB] tabular-nums tracking-tight">
            {value}
          </div>
          {subValue && (
            <span className="text-xs text-[#9AA3AE] font-medium tabular-nums">
              {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Trend Indicator & Sparkline Visual */}
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                isNeutral
                  ? "bg-[#171C24] text-[#9AA3AE]"
                  : isPositive
                  ? "bg-[#4ADE80]/10 text-[#4ADE80]"
                  : "bg-[#F87171]/10 text-[#F87171]"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-[11px] text-[#697381] truncate">
              {changePeriod}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-[#697381]">Real-time telemetry</div>
        )}

        {/* Micro sparkline visualization */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end gap-1 h-5 flex-shrink-0" aria-hidden="true">
            {sparklineData.map((val, idx) => {
              const max = Math.max(...sparklineData, 1);
              const heightPct = Math.max(15, Math.round((val / max) * 100));
              const isLast = idx === sparklineData.length - 1;
              return (
                <div
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className={`w-1 rounded-sm transition-all duration-300 ${
                    isLast
                      ? "bg-[#7C83FF]"
                      : "bg-[#252C38] group-hover:bg-[#343D4D]"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
