import { api } from "@/lib/axios";
import { MovieDetailResponse, MovieListResponse } from "@/features/movies/types/movie.types";

export const movieService = {
  async getMovies(): Promise<MovieListResponse> {
    const response = await api.get("/movies");
    return response.data;
  },

  async getMovieById(id: string): Promise<MovieDetailResponse> {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },
};