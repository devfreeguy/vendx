"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiration = new Date(expiresAt).getTime();
      const distance = expiration - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("EXPIRED");
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <span
      className={`font-mono font-bold ${
        isExpired ? "text-destructive" : "text-primary"
      }`}
    >
      {timeLeft}
    </span>
  );
}
