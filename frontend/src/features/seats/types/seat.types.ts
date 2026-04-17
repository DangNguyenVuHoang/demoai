export type SeatVisualStatus = "AVAILABLE" | "BOOKED" | "LOCKED" | "SELECTED";

export type SeatType = "STANDARD" | "VIP" | "COUPLE";

export type SeatMapItem = {
  id: string;
  seatRow: string;
  seatNumber: number;
  seatType: SeatType;
  priceModifier: number;
  finalPrice: number;
  label?: string;
  status: "AVAILABLE" | "BOOKED" | "LOCKED";
};

export type SeatMapResponse = {
  showtimeId: string;
  movieTitle?: string;
  cinemaName?: string;
  theaterName?: string;
  roomName?: string;
  startTime?: string;
  basePrice?: number;
  seats: SeatMapItem[];
};