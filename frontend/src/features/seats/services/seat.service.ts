import { api } from "@/lib/axios";
import { SeatMapResponse, SeatMapItem } from "@/features/seats/types/seat.types";

type BackendSeatItem = {
  id: string;
  seatRow: string;
  seatNumber: number;
  seatType: "STANDARD" | "VIP" | "COUPLE";
  priceModifier: number;
  status: boolean;
  label?: string;
  isBooked: boolean;
  finalPrice: number;
};

type BackendSeatMapResponse = {
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
    basePrice: number;
    status: string;
  };
  movie?: {
    id: string;
    title: string;
    slug: string;
    posterUrl?: string | null;
    durationMinutes?: number;
  };
  cinema?: {
    id: string;
    name: string;
    city?: string;
    address?: string;
  };
  theater?: {
    id: string;
    name: string;
    type?: string;
    totalRows?: number;
    totalCols?: number;
  };
  seats: BackendSeatItem[];
};

const mapSeatStatus = (
  seat: BackendSeatItem,
): SeatMapItem["status"] => {
  if (!seat.status) return "LOCKED";
  if (seat.isBooked) return "BOOKED";
  return "AVAILABLE";
};

export const seatService = {
  async getSeatMapByShowtime(showtimeId: string): Promise<SeatMapResponse> {
    const response = await api.get<BackendSeatMapResponse>(
      `/showtimes/${showtimeId}/seats`,
    );

    const data = response.data;

    return {
      showtimeId: data.showtime.id,
      movieTitle: data.movie?.title,
      cinemaName: data.cinema?.name,
      theaterName: data.theater?.name,
      roomName: data.theater?.name,
      startTime: data.showtime.startTime,
      basePrice: data.showtime.basePrice,
      seats: data.seats.map((seat) => ({
        id: seat.id,
        seatRow: seat.seatRow,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        priceModifier: seat.priceModifier,
        finalPrice: seat.finalPrice,
        label: seat.label,
        status: mapSeatStatus(seat),
      })),
    };
  },
};