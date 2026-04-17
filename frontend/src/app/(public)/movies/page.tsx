import Container from "@/components/layout/Container";
import MovieListClient from "@/features/movies/components/MovieListClient";

export default function MoviesPage() {
  return (
    <main className="py-8">
      <Container>
        <h1 className="mb-6 text-2xl font-bold">Movies</h1>
        <MovieListClient />
      </Container>
    </main>
  );
}