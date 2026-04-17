export type ShowtimeStatus =
  | "SCHEDULED"
  | "OPEN"
  | "CLOSED"
  | "CANCELLED";

export type ShowtimeItem = {
  id: string;
  movieId: string;
  theaterId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: ShowtimeStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ShowtimeListResponse = ShowtimeItem[];

export type ShowtimeDetailResponse = ShowtimeItem;