"use client";

import { useBookingCountdown } from "@/features/bookings/hooks/useBookingCountdown";

type Props = {
  expiredAt?: string | null;
  status?: string;
};

export default function BookingCountdown({ expiredAt, status }: Props) {
  const normalizedStatus = (status || "").trim().toUpperCase();
  const { formatted, isExpired } = useBookingCountdown(expiredAt);

  if (!expiredAt) {
    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Payment countdown</p>
        <p className="mt-1 font-medium text-slate-800">No expiration time</p>
      </div>
    );
  }

  if (normalizedStatus === "PAID") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
        <p className="text-sm text-green-700">Payment countdown</p>
        <p className="mt-1 text-lg font-bold text-green-700">Paid</p>
      </div>
    );
  }

  if (
    normalizedStatus === "EXPIRED" ||
    normalizedStatus === "CANCELLED" ||
    isExpired
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <p className="text-sm text-red-700">Payment countdown</p>
        <p className="mt-1 text-lg font-bold text-red-700">Expired</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <p className="text-sm text-amber-700">Payment countdown</p>
      <p className="mt-1 text-2xl font-bold text-amber-700">{formatted}</p>
    </div>
  );
}