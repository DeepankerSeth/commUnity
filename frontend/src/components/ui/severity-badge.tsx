import React from 'react';
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export const getSeverityColor = (severity: number): string => {
  if (severity >= 8) return 'bg-red-500 text-red-50';
  if (severity >= 6) return 'bg-orange-500 text-orange-50';
  if (severity >= 4) return 'bg-yellow-500 text-yellow-900';
  if (severity >= 2) return 'bg-blue-500 text-blue-50';
  return 'bg-green-500 text-green-50';
};

export const getSeverityLabel = (severity: number): string => {
  if (severity >= 8) return 'Critical';
  if (severity >= 6) return 'High';
  if (severity >= 4) return 'Moderate';
  if (severity >= 2) return 'Low';
  return 'Very Low';
};

interface SeverityBadgeProps {
  severity: number;
  showLabel?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, showLabel = false, className }) => {
  const colorClass = getSeverityColor(severity);
  const label = getSeverityLabel(severity);

  return (
    <Badge className={cn(colorClass, "font-semibold", className)}>
      {showLabel ? label : `Severity: ${severity}`}
    </Badge>
  );
};
