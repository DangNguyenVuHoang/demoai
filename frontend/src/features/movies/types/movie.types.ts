export type MovieStatus =
  | "UPCOMING"
  | "NOW_SHOWING"
  | "ENDED"
  | "HIDDEN";

export type MovieItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  durationMinutes: number;
  ageRating?: string | null;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  language?: string | null;
  subtitle?: string | null;
  releaseDate?: string | null;
  endDate?: string | null;
  status: MovieStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type MovieListResponse = MovieItem[];

export type MovieDetailResponse = MovieItem;