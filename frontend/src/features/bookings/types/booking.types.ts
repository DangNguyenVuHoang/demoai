export type BookingStatus =
  | "PENDING"
  | "HOLDING"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export type BookingSeatItem = {
  id?: string;
  seatId?: string;
  seatRow?: string;
  seatNumber?: number;
  seatType?: string;
  priceAtBooking?: number;
  finalPrice?: number;
  label?: string;
};

export type BookingPayment = {
  id?: string;
  provider?: string;
  transactionRef?: string;
  gatewayTransactionId?: string;
  amount?: number;
  status?: PaymentStatus;
  paymentUrl?: string | null;
  paidAt?: string | null;
};

export type BookingDetail = {
  id: string;
  bookingCode?: string;
  totalAmount: number;
  status: BookingStatus;
  expiredAt?: string | null;
  showtimeId?: string;
  userId?: string;

  movieTitle?: string;
  cinemaName?: string;
  theaterName?: string;
  startTime?: string;

  seats?: BookingSeatItem[];
  payment?: BookingPayment;

  createdAt?: string;
  updatedAt?: string;
};

export type BookingListResponse = BookingDetail[];

export type CreateBookingPayload = {
  showtimeId: string;
  seatIds: string[];
};

export type CreateBookingResponse = {
  id: string;
  bookingCode?: string;
  totalAmount: number;
  status: BookingStatus;
  expiredAt?: string | null;
  showtimeId?: string;
  userId?: string;
  seats?: BookingSeatItem[];
  createdAt?: string;
  updatedAt?: string;
};