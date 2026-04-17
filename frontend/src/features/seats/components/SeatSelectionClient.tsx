"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import ScreenBanner from "@/features/seats/components/ScreenBanner";
import SeatLegend from "@/features/seats/components/SeatLegend";
import SeatGrid from "@/features/seats/components/SeatGrid";
import SeatSummary from "@/features/seats/components/SeatSummary";
import { useSeatMap } from "@/features/seats/hooks/useSeatMap";
import { useSeatSelection } from "@/features/seats/hooks/useSeatSelection";
import { useCreateBooking } from "@/features/bookings/hooks/useCreateBooking";

type Props = {
  showtimeId: string;
};

export default function SeatSelectionClient({ showtimeId }: Props) {
  const router = useRouter();

  const { data, isLoading, isError, error } = useSeatMap(showtimeId);

  const seats = data?.seats ?? [];

  const {
    selectedSeatIds,
    selectedSeats,
    totalAmount,
    toggleSeat,
    clearSelectedSeats,
  } = useSeatSelection(seats);

  const createBookingMutation = useCreateBooking();

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    try {
      const payload = {
        showtimeId,
        seatIds: selectedSeats.map((seat) => seat.id),
      };

      const booking = await createBookingMutation.mutateAsync(payload);

      toast.success("Booking created successfully");

      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create booking",
      );
    }
  };

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

  if (!data || seats.length === 0) {
    return <EmptyState title="No seats found" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {data.movieTitle || "Seat Selection"}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {[data.cinemaName, data.theaterName, data.startTime]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>

        <ScreenBanner />
        <SeatLegend />

        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <SeatGrid
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={toggleSeat}
          />
        </div>
      </div>

      <div>
        <SeatSummary
          selectedSeats={selectedSeats}
          totalAmount={totalAmount}
          onContinue={handleContinue}
          onClear={clearSelectedSeats}
          isSubmitting={createBookingMutation.isPending}
        />
      </div>
    </div>
  );
}