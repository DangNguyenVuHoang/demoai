"use client";

import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/features/movies/services/movie.service";

export const useMovieDetail = (id: string) => {
  return useQuery({
    queryKey: ["movie-detail", id],
    queryFn: () => movieService.getMovieById(id),
    enabled: !!id,
  });
};