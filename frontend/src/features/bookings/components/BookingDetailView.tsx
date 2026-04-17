import Button from "@/components/common/Button";
import { BookingDetail } from "@/features/bookings/types/booking.types";
import BookingCountdown from "@/features/bookings/components/BookingCountdown";
import BookingSeatList from "@/features/bookings/components/BookingSeatList";

type Props = {
  booking: BookingDetail;
  onPay?: () => void;
  isPaying?: boolean;
};

const isBookingPayable = (booking: BookingDetail) => {
  const normalizedStatus = (booking.status || "").trim().toUpperCase();
  const paymentStatus = (booking.payment?.status || "").trim().toUpperCase();

  const statusAllowsPay =
    normalizedStatus === "PENDING" || normalizedStatus === "HOLDING";

  if (!statusAllowsPay) return false;
  if (paymentStatus === "SUCCESS") return false;

  if (!booking.expiredAt) return true;

  const expiredMs = new Date(booking.expiredAt).getTime();
  if (Number.isNaN(expiredMs)) return true;

  return expiredMs > Date.now();
};

export default function BookingDetailView({
  booking,
  onPay,
  isPaying = false,
}: Props) {
  const canPay = isBookingPayable(booking);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">Booking Detail</h1>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Booking ID</p>
              <p className="break-all font-medium text-slate-800">{booking.id}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Booking Code</p>
              <p className="font-medium text-slate-800">
                {booking.bookingCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-medium text-slate-800">{booking.status}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="font-medium text-slate-800">
                {booking.totalAmount.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Movie</p>
              <p className="font-medium text-slate-800">
                {booking.movieTitle || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Cinema</p>
              <p className="font-medium text-slate-800">
                {booking.cinemaName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Theater</p>
              <p className="font-medium text-slate-800">
                {booking.theaterName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Start Time</p>
              <p className="font-medium text-slate-800">
                {booking.startTime || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Payment Status</p>
              <p className="font-medium text-slate-800">
                {booking.payment?.status || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Payment Provider</p>
              <p className="font-medium text-slate-800">
                {booking.payment?.provider || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <BookingSeatList seats={booking.seats} />
      </div>

      <div className="space-y-4">
        <BookingCountdown
          expiredAt={booking.expiredAt}
          status={booking.status}
        />

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold">Payment Action</h3>

          <p className="mt-2 text-sm text-slate-500">
            Continue to payment before the booking expires.
          </p>

          <div className="mt-5">
            <Button
              className="w-full"
              onClick={onPay}
              disabled={!canPay || isPaying}
            >
              {isPaying ? "Processing..." : "Pay Now"}
            </Button>
          </div>

          {!canPay && (
            <p className="mt-3 text-sm text-red-600">
              This booking is not eligible for payment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}