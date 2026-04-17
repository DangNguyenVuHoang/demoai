import Container from "@/components/layout/Container";
import BookingDetailClient from "@/features/bookings/components/BookingDetailClient";

type Props = {
  params: Promise<{ bookingId: string }>;
};

export default async function BookingDetailPage({ params }: Props) {
  const { bookingId } = await params;

  return (
    <main className="py-8">
      <Container>
        <BookingDetailClient bookingId={bookingId} />
      </Container>
    </main>
  );
}