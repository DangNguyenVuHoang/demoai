"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";
import BookingDetailView from "@/features/bookings/components/BookingDetailView";
import { useBookingDetail } from "@/features/bookings/hooks/useBookingDetail";

type Props = {
  bookingId: string;
};

export default function BookingDetailClient({ bookingId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useBookingDetail(bookingId);

  const handlePay = () => {
    if (!data) return;

    toast.success("Ready to connect payment API");
    router.push(`/payments/result?bookingId=${data.id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Cannot load booking detail"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  if (!data) {
    return <ErrorState title="Booking not found" />;
  }

  return <BookingDetailView booking={data} onPay={handlePay} />;
}