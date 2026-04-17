"use client";

import { useMutation } from "@tanstack/react-query";
import { bookingService } from "@/features/bookings/services/booking.service";
import { CreateBookingPayload } from "@/features/bookings/types/booking.types";

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingService.createBooking(payload),
  });
};