"use client";

import { useQuery } from "@tanstack/react-query";
import { showtimeService } from "@/features/showtimes/services/showtime.service";

export const useShowtimes = () => {
  return useQuery({
    queryKey: ["showtimes"],
    queryFn: showtimeService.getShowtimes,
  });
};