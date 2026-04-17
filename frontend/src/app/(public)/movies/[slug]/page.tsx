import Container from "@/components/layout/Container";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function MovieDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="py-8">
      <Container>
        <h1 className="text-2xl font-bold">Movie Detail Page</h1>
        <p className="mt-2 text-sm text-slate-600">
          Current slug route: {slug}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Backend currently provides GET /api/movies/{"{id}"}, not slug endpoint yet.
        </p>
      </Container>
    </main>
  );
}