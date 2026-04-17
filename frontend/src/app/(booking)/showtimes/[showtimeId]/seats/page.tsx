import Container from "@/components/layout/Container";
import SeatSelectionClient from "@/features/seats/components/SeatSelectionClient";

type Props = {
  params: Promise<{ showtimeId: string }>;
};

export default async function SeatSelectionPage({ params }: Props) {
  // Await the params to get the showtimeId. Because this is a server component, we can await the params directly.
    const { showtimeId } = await params;

  return (
    <main className="py-8">
      <Container>
        <SeatSelectionClient showtimeId={showtimeId} />
      </Container>
    </main>
  );
}