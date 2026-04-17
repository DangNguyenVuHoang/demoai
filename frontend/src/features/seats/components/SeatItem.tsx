import { SeatVisualStatus } from "@/features/seats/types/seat.types";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  status: SeatVisualStatus;
  seatType?: "STANDARD" | "VIP" | "COUPLE";
  onClick?: () => void;
};

export default function SeatItem({
  label,
  status,
  seatType = "STANDARD",
  onClick,
}: Props) {
  const clickable = status === "AVAILABLE" || status === "SELECTED";

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md text-xs font-semibold transition",
        clickable && "cursor-pointer",
        !clickable && "cursor-not-allowed opacity-90",
        status === "AVAILABLE" &&
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
        status === "SELECTED" && "bg-blue-600 text-white",
        status === "BOOKED" && "bg-red-500 text-white",
        status === "LOCKED" && "bg-slate-400 text-white",
        seatType === "VIP" &&
        status === "AVAILABLE" &&
        "border-2 border-amber-400",
        seatType === "COUPLE" &&
        status === "AVAILABLE" &&
        "border-2 border-pink-400",
      )}
      title={label}
    >
      {label.replace(/^[A-Z]/, "")}
    </button>
  );
}