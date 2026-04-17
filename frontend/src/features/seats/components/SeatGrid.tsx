import SeatItem from "@/features/seats/components/SeatItem";
import { SeatMapItem } from "@/features/seats/types/seat.types";

type Props = {
  seats: SeatMapItem[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: SeatMapItem) => void;
};

export default function SeatGrid({
  seats,
  selectedSeatIds,
  onToggleSeat,
}: Props) {
  const groupedByRow = seats.reduce<Record<string, SeatMapItem[]>>((acc, seat) => {
    if (!acc[seat.seatRow]) {
      acc[seat.seatRow] = [];
    }
    acc[seat.seatRow].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(groupedByRow).sort();

  return (
    <div className="space-y-3">
      {sortedRows.map((row) => {
        const rowSeats = groupedByRow[row].sort(
          (a, b) => a.seatNumber - b.seatNumber,
        );

        return (
          <div key={row} className="flex items-center gap-3">
            <div className="w-6 text-sm font-bold text-slate-600">{row}</div>

            <div className="flex flex-wrap gap-2">
              {rowSeats.map((seat) => {
                const status = selectedSeatIds.includes(seat.id)
                  ? "SELECTED"
                  : seat.status;

                return (
                  <SeatItem
                    key={seat.id}
                    label={seat.label || `${seat.seatRow}${seat.seatNumber}`}
                    status={status}
                    seatType={seat.seatType}
                    onClick={() => onToggleSeat(seat)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}