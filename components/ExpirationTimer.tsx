"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ExpirationTimerProps {
  expiresAt: string | Date | number;
  variant?: "compact" | "card" | "detailed" | "banner";
  showIcon?: boolean;
  onExpire?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
  };
}

export function ExpirationTimer({
  expiresAt,
  variant = "compact",
  showIcon = true,
  onExpire,
  className = "",
}: ExpirationTimerProps) {
  const targetDate = new Date(expiresAt);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    // Ticking every 1 second
    const interval = setInterval(() => {
      const updated = calculateTimeLeft(targetDate);
      setTimeLeft(updated);
      if (updated.isExpired) {
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  // Determine alert urgency color
  const isCritical = timeLeft.totalSeconds > 0 && timeLeft.totalSeconds < 900; // < 15 mins
  const isWarning = timeLeft.totalSeconds > 0 && timeLeft.totalSeconds < 7200; // < 2 hours

  // 1. Compact Pill (used in lists and tables)
  if (variant === "compact") {
    if (timeLeft.isExpired) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-rose-400" />}
          EXPIRED
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-colors ${
          isCritical
            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse"
            : isWarning
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        } ${className}`}
      >
        {showIcon && <Clock className="w-3 h-3" />}
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {pad(timeLeft.hours)}h:{pad(timeLeft.minutes)}m:{pad(timeLeft.seconds)}s left
      </span>
    );
  }

  // 2. Banner (used atop details and payment terminals)
  if (variant === "banner") {
    if (timeLeft.isExpired) {
      return (
        <div className={`p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs font-mono ${className}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-bold">This PASS has expired (00h:00m:00s remaining).</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
            Locked
          </span>
        </div>
      );
    }

    return (
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isCritical
            ? "bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse"
            : isWarning
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-white text-sm">
              Live Policy Expiration Window
            </div>
            <div className="text-[11px] text-gray-400">
              Valid until: {targetDate.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm font-black bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
            {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
          </span>
        </div>
      </div>
    );
  }

  // 3. Detailed / Card (clock blocks)
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Time Remaining:
        </span>
        <span
          className={`font-mono font-bold text-[11px] ${
            timeLeft.isExpired
              ? "text-rose-400"
              : isCritical
              ? "text-rose-400"
              : isWarning
              ? "text-amber-400"
              : "text-emerald-400"
          }`}
        >
          {timeLeft.isExpired ? "EXPIRED" : "ACTIVE COUNTDOWN"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-lg font-black text-white">{pad(timeLeft.days)}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider">Days</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-lg font-black text-white">{pad(timeLeft.hours)}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider">Hours</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-lg font-black text-white">{pad(timeLeft.minutes)}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider">Mins</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className={`text-lg font-black ${timeLeft.isExpired ? "text-gray-500" : "text-emerald-400 animate-pulse"}`}>
            {pad(timeLeft.seconds)}
          </div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider">Secs</div>
        </div>
      </div>
    </div>
  );
}
