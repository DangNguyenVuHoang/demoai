"use client";

import { useEffect, useMemo, useState } from "react";

const getRemainingMs = (expiredAt?: string | null) => {
  if (!expiredAt) return 0;

  const expiredTime = new Date(expiredAt).getTime();
  if (Number.isNaN(expiredTime)) return 0;

  const now = Date.now();
  return Math.max(expiredTime - now, 0);
};

export const useBookingCountdown = (expiredAt?: string | null) => {
  const [remainingMs, setRemainingMs] = useState<number>(
    getRemainingMs(expiredAt),
  );

  useEffect(() => {
    setRemainingMs(getRemainingMs(expiredAt));

    if (!expiredAt) return;

    const interval = setInterval(() => {
      setRemainingMs(getRemainingMs(expiredAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt]);

  const isExpired = remainingMs <= 0;

  const formatted = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingMs]);

  return {
    remainingMs,
    formatted,
    isExpired,
  };
};