"use client";

import { useQuery } from "@tanstack/react-query";
import { seatService } from "@/features/seats/services/seat.service";

export const useSeatMap = (showtimeId: string) => {
  return useQuery({
    queryKey: ["seat-map", showtimeId],
    queryFn: () => seatService.getSeatMapByShowtime(showtimeId),
    enabled: !!showtimeId,
    refetchOnWindowFocus: false,
  });
};