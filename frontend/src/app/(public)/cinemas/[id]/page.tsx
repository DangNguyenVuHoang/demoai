import Container from "@/components/layout/Container";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CinemaDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="py-8">
      <Container>
        <h1 className="text-2xl font-bold">Cinema Detail</h1>
        <p className="mt-2 text-sm text-slate-600">Cinema ID: {id}</p>
      </Container>
    </main>
  );
}