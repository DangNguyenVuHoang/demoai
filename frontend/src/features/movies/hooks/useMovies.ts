"use client";

import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/features/movies/services/movie.service";

export const useMovies = () => {
  return useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
  });
};