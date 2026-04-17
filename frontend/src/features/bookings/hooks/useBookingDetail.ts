"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/features/bookings/services/booking.service";

export const useBookingDetail = (bookingId: string) => {
  return useQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  });
};