"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#10b981",
  showPercentage = true,
  children,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold"
            style={{ color }}
          >
            {Math.round(progress)}%
          </motion.span>
        )}
        {children}
      </div>
    </div>
  );
}

interface ProgressRingCardProps {
  title: string;
  current: number;
  target: number;
  color?: string;
  size?: number;
  icon?: React.ReactNode;
}

export function ProgressRingCard({
  title,
  current,
  target,
  color = "#10b981",
  size = 100,
  icon,
}: ProgressRingCardProps) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative bg-card border rounded-2xl p-6 overflow-hidden group cursor-pointer"
    >
      <div 
        className="absolute inset-0 opacity-5 bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="flex items-center gap-2">
          {icon && (
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        </div>

        <ProgressRing progress={progress} size={size} color={color} />

        <div className="space-y-1 w-full">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-semibold" style={{ color }}>
              {formatCurrency(current)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold">
              {formatCurrency(target)}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium text-muted-foreground">
                {formatCurrency(Math.max(0, target - current))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
