"use client";

import { useMovieDetail } from "@/features/movies/hooks/useMovieDetail";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";

type Props = {
  movieId: string;
};

export default function MovieDetailClient({ movieId }: Props) {
  const { data, isLoading, isError, error } = useMovieDetail(movieId);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Cannot load movie detail"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  if (!data) {
    return <ErrorState title="Movie not found" />;
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="mt-2 text-sm text-slate-600">Status: {data.status}</p>
      <p className="mt-2 text-sm text-slate-600">
        Duration: {data.durationMinutes} minutes
      </p>
      <p className="mt-2 text-sm text-slate-600">Slug: {data.slug}</p>
      <p className="mt-2 text-sm text-slate-600">
        Description: {data.description || "No description"}
      </p>
    </div>
  );
}