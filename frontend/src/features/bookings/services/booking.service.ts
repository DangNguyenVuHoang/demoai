import { api } from "@/lib/axios";
import {
  BookingDetail,
  BookingListResponse,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/features/bookings/types/booking.types";

type BackendBookingSeat = {
  id: string;
  bookingId: string;
  seatId: string;
  priceAtBooking: number;
  seat?: {
    id: string;
    theaterId: string;
    seatRow: string;
    seatNumber: number;
    seatType: string;
    priceModifier: number;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

type BackendBookingPayment = {
  id: string;
  bookingId: string;
  provider: string;
  transactionRef?: string;
  gatewayTransactionId?: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentUrl?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type BackendBookingDetail = {
  id: string;
  userId: string;
  showtimeId: string;
  bookingCode: string;
  totalAmount: number;
  status: BookingDetail["status"];
  expiredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  showtime?: {
    id: string;
    movieId?: string;
    theaterId?: string;
    startTime?: string;
    endTime?: string;
    basePrice?: number;
    status?: string;
    movie?: {
      id?: string;
      title?: string;
      slug?: string;
    };
    theater?: {
      id?: string;
      name?: string;
      cinema?: {
        id?: string;
        name?: string;
      };
    };
  };

  bookingSeats?: BackendBookingSeat[];
  payment?: BackendBookingPayment | null;
};

const mapBookingDetail = (data: BackendBookingDetail): BookingDetail => {
  return {
    id: data.id,
    bookingCode: data.bookingCode,
    totalAmount: data.totalAmount,
    status: data.status,
    expiredAt: data.expiredAt,
    showtimeId: data.showtimeId,
    userId: data.userId,
    movieTitle: data.showtime?.movie?.title,
    cinemaName: data.showtime?.theater?.cinema?.name,
    theaterName: data.showtime?.theater?.name,
    startTime: data.showtime?.startTime,
    seats: (data.bookingSeats || []).map((item) => ({
      id: item.id,
      seatId: item.seatId || item.seat?.id,
      seatRow: item.seat?.seatRow,
      seatNumber: item.seat?.seatNumber,
      seatType: item.seat?.seatType,
      priceAtBooking: item.priceAtBooking,
      finalPrice: item.priceAtBooking,
      label:
        item.seat?.seatRow && item.seat?.seatNumber
          ? `${item.seat.seatRow}${item.seat.seatNumber}`
          : undefined,
    })),
    payment: data.payment
      ? {
          id: data.payment.id,
          provider: data.payment.provider,
          transactionRef: data.payment.transactionRef,
          gatewayTransactionId: data.payment.gatewayTransactionId,
          amount: data.payment.amount,
          status: data.payment.status,
          paymentUrl: data.payment.paymentUrl,
          paidAt: data.payment.paidAt,
        }
      : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const bookingService = {
  async getBookingById(id: string): Promise<BookingDetail> {
    const response = await api.get<BackendBookingDetail>(`/bookings/${id}`);
    return mapBookingDetail(response.data);
  },

  async getMyBookings(): Promise<BookingListResponse> {
    const response = await api.get<BackendBookingDetail[]>("/bookings/me");
    return response.data.map(mapBookingDetail);
  },

  async createBooking(
    payload: CreateBookingPayload,
  ): Promise<CreateBookingResponse> {
    const response = await api.post("/bookings", payload);
    return response.data;
  },
};