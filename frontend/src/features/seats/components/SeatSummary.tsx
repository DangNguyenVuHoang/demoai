import Button from "@/components/common/Button";
import { SeatMapItem } from "@/features/seats/types/seat.types";

type Props = {
  selectedSeats: SeatMapItem[];
  totalAmount: number;
  onContinue?: () => void;
  onClear?: () => void;
  isSubmitting?: boolean;
};

export default function SeatSummary({
  selectedSeats,
  totalAmount,
  onContinue,
  onClear,
  isSubmitting = false,
}: Props) {
  const seatLabels = selectedSeats.map(
    (seat) => `${seat.seatRow}${seat.seatNumber}`,
  );

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Booking Summary</h3>

      <div className="mb-4">
        <p className="mb-1 text-sm text-slate-500">Selected seats</p>
        <p className="text-sm font-medium text-slate-800">
          {seatLabels.length > 0 ? seatLabels.join(", ") : "No seat selected"}
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-1 text-sm text-slate-500">Total seats</p>
        <p className="font-medium text-slate-800">{selectedSeats.length}</p>
      </div>

      <div className="mb-6">
        <p className="mb-1 text-sm text-slate-500">Total amount</p>
        <p className="text-2xl font-bold text-blue-600">
          {totalAmount.toLocaleString("vi-VN")}đ
        </p>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={onContinue}
          disabled={selectedSeats.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Continue"}
        </Button>

        <Button
          type="button"
          className="w-full bg-slate-200 text-slate-900 hover:bg-slate-300"
          onClick={onClear}
          disabled={selectedSeats.length === 0 || isSubmitting}
        >
          Clear selection
        </Button>
      </div>
    </div>
  );
}