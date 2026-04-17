"use client";

import { useMovies } from "@/features/movies/hooks/useMovies";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

export default function MovieListClient() {
  const { data, isLoading, isError, error } = useMovies();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Cannot load movies"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No movies found" />;
  }

  return (
    <div className="space-y-4">
      {data.map((movie) => (
        <div key={movie.id} className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold">{movie.title}</h3>
          <p className="mt-1 text-sm text-slate-600">Status: {movie.status}</p>
          <p className="mt-1 text-sm text-slate-600">
            Duration: {movie.durationMinutes} minutes
          </p>
          <p className="mt-1 text-sm text-slate-600">Slug: {movie.slug}</p>
        </div>
      ))}
    </div>
  );
}