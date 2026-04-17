"use client";

import { useSeatMap } from "@/features/seats/hooks/useSeatMap";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

type Props = {
  showtimeId: string;
};

export default function SeatMapDebugClient({ showtimeId }: Props) {
  const { data, isLoading, isError, error } = useSeatMap(showtimeId);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Cannot load seat map"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  if (!data || !data.seats || data.seats.length === 0) {
    return <EmptyState title="No seats found" />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Seat Map Debug</h2>
        <p className="mt-1 text-sm text-slate-600">
          Showtime ID: {data.showtimeId}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Total seats: {data.seats.length}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.seats.map((seat) => (
          <div key={seat.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="font-medium">
              {seat.seatRow}
              {seat.seatNumber}
            </p>
            <p className="text-sm text-slate-600">Type: {seat.seatType}</p>
            <p className="text-sm text-slate-600">Status: {seat.status}</p>
            <p className="text-sm text-slate-600">
              Final price: {seat.finalPrice}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}