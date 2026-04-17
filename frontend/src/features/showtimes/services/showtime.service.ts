import { api } from "@/lib/axios";
import {
  ShowtimeDetailResponse,
  ShowtimeListResponse,
} from "@/features/showtimes/types/showtime.types";

export const showtimeService = {
  async getShowtimes(): Promise<ShowtimeListResponse> {
    const response = await api.get("/showtimes");
    return response.data;
  },

  async getShowtimeById(id: string): Promise<ShowtimeDetailResponse> {
    const response = await api.get(`/showtimes/${id}`);
    return response.data;
  },
};