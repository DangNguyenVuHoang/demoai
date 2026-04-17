"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/features/bookings/services/booking.service";

export const useMyBookings = () => {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingService.getMyBookings,
  });
};