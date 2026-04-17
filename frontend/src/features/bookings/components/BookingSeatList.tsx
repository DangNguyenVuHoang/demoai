import { BookingSeatItem } from "@/features/bookings/types/booking.types";

type Props = {
  seats?: BookingSeatItem[];
};

export default function BookingSeatList({ seats = [] }: Props) {
  if (!seats.length) {
    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold">Selected Seats</h3>
        <p className="mt-2 text-sm text-slate-500">No seat information.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold">Selected Seats</h3>

      <div className="mt-4 space-y-3">
        {seats.map((seat, index) => {
          const label =
            seat.label ||
            (seat.seatRow && seat.seatNumber
              ? `${seat.seatRow}${seat.seatNumber}`
              : `Seat ${index + 1}`);

          const price = seat.finalPrice ?? seat.priceAtBooking ?? 0;

          return (
            <div
              key={seat.id || seat.seatId || `${label}-${index}`}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium text-slate-800">{label}</p>
                <p className="text-sm text-slate-500">
                  {seat.seatId ? `Seat ID: ${seat.seatId}` : "Seat"}
                </p>
              </div>

              <p className="font-semibold text-slate-800">
                {price.toLocaleString("vi-VN")}đ
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}