"use client";

import { useQuery } from "@tanstack/react-query";
import { showtimeService } from "@/features/showtimes/services/showtime.service";

export const useShowtimeDetail = (id: string) => {
  return useQuery({
    queryKey: ["showtime-detail", id],
    queryFn: () => showtimeService.getShowtimeById(id),
    enabled: !!id,
  });
};