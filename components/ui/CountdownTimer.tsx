"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(0);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  // Format MM:SS
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="font-mono text-xl font-bold tabular-nums text-orange-600 bg-orange-50 px-3 py-1 rounded-md border border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50">
      {formattedTime}
    </div>
  );
}
