import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
} from '@prisma/client';
import { SeatLockService } from 'src/bookings/seat-lock.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeatMapGateway } from 'src/realtime/seat-map.gateway';
import { TicketsService } from 'src/tickets/tickets.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VNPayService } from './providers/vnpay.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpayService: VNPayService,
    private readonly seatLockService: SeatLockService,
    private readonly seatMapGateway: SeatMapGateway,
    private readonly ticketsService: TicketsService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, clientIp: string) {
    const { bookingId } = createPaymentDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        bookingSeats: true,
        showtime: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.HOLDING
    ) {
      throw new BadRequestException('Booking is not eligible for payment');
    }

    if (booking.expiredAt && new Date(booking.expiredAt) < new Date()) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.EXPIRED },
      });

      await this.seatLockService.releaseSeats(
        booking.showtimeId,
        booking.bookingSeats.map((item) => item.seatId),
      );

      this.seatMapGateway.emitSeatMapUpdated(booking.showtimeId, {
        action: 'BOOKING_EXPIRED_BEFORE_PAYMENT',
        seatIds: booking.bookingSeats.map((item) => item.seatId),
        bookingId: booking.id,
      });

      throw new BadRequestException('Booking has expired');
    }

    if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Booking already paid');
    }

    const txnRef = booking.bookingCode
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 100);

    const paymentUrl = this.vnpayService.createPaymentUrl({
      amount: booking.totalAmount,
      txnRef,
      clientIp,
      orderInfo: `Thanh toan ve phim ${txnRef}`,
    });

    const paymentData = {
      provider: PaymentProvider.VNPAY,
      transactionRef: txnRef,
      amount: booking.totalAmount,
      status: PaymentStatus.PENDING,
      paymentUrl,
    };

    if (booking.payment) {
      await this.prisma.payment.update({
        where: { bookingId: booking.id },
        data: paymentData,
      });
    } else {
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          ...paymentData,
        },
      });
    }

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.HOLDING,
      },
    });

    return {
      message: 'Payment URL created successfully',
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      txnRef,
      paymentUrl,
    };
  }

  async handleVNPayReturn(query: Record<string, any>) {
    const isValidSignature = this.vnpayService.verifyReturnUrl(query);

    if (!isValidSignature) {
      throw new BadRequestException('Invalid VNPay signature');
    }

    const txnRef = query['vnp_TxnRef'] as string;
    const responseCode = query['vnp_ResponseCode'] as string;
    const transactionNo = query['vnp_TransactionNo'] as string;
    const amount = Math.round(Number(query['vnp_Amount'] || 0) / 100);

    const payment = await this.prisma.payment.findFirst({
      where: { transactionRef: txnRef },
      include: {
        booking: {
          include: {
            bookingSeats: true,
            tickets: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (Math.round(payment.amount) !== amount) {
      throw new BadRequestException('Amount mismatch');
    }

    if (responseCode === '00') {
      return this.handlePaymentSuccess(payment, transactionNo, query);
    }

    return this.handlePaymentFailure(payment, transactionNo, responseCode, query);
  }

  private async handlePaymentSuccess(
    payment: any,
    transactionNo: string,
    rawResponse: Record<string, any>,
  ) {
    // Idempotent: nếu payment đã success rồi thì không update lại
    if (payment.status === PaymentStatus.SUCCESS) {
      const existingTickets = await this.prisma.ticket.findMany({
        where: { bookingId: payment.bookingId },
        orderBy: { createdAt: 'asc' },
      });

      return {
        message: 'Payment already processed',
        bookingId: payment.bookingId,
        paymentId: payment.id,
        status: payment.status,
        tickets: existingTickets,
      };
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        gatewayTransactionId: transactionNo,
        rawResponse,
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.PAID },
    });

    const generatedTickets = await this.ticketsService.generateTicketsForBooking(
      payment.bookingId,
    );

    await this.seatLockService.releaseSeats(
      payment.booking.showtimeId,
      payment.booking.bookingSeats.map((item) => item.seatId),
    );

    this.seatMapGateway.emitSeatMapUpdated(payment.booking.showtimeId, {
      action: 'PAYMENT_SUCCESS',
      seatIds: payment.booking.bookingSeats.map((item) => item.seatId),
      bookingId: payment.bookingId,
    });

    console.log('PAYMENT SUCCESS - seats released', {
      showtimeId: payment.booking.showtimeId,
      seatIds: payment.booking.bookingSeats.map((item) => item.seatId),
      bookingId: payment.bookingId,
      ticketCount: generatedTickets.tickets.length,
    });

    return {
      message: 'Payment success',
      bookingId: payment.bookingId,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      tickets: generatedTickets.tickets,
    };
  }

  private async handlePaymentFailure(
    payment: any,
    transactionNo: string,
    responseCode: string,
    rawResponse: Record<string, any>,
  ) {
    // Idempotent: nếu payment đã failed rồi thì trả luôn
    if (payment.status === PaymentStatus.FAILED) {
      return {
        message: 'Payment already marked as failed',
        bookingId: payment.bookingId,
        paymentId: payment.id,
        status: payment.status,
        responseCode,
      };
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        gatewayTransactionId: transactionNo,
        rawResponse,
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await this.seatLockService.releaseSeats(
      payment.booking.showtimeId,
      payment.booking.bookingSeats.map((item) => item.seatId),
    );

    this.seatMapGateway.emitSeatMapUpdated(payment.booking.showtimeId, {
      action: 'PAYMENT_FAILED',
      seatIds: payment.booking.bookingSeats.map((item) => item.seatId),
      bookingId: payment.bookingId,
      responseCode,
    });

    console.log('PAYMENT FAILED - seats released', {
      showtimeId: payment.booking.showtimeId,
      seatIds: payment.booking.bookingSeats.map((item) => item.seatId),
      bookingId: payment.bookingId,
      responseCode,
    });

    return {
      message: 'Payment failed',
      bookingId: payment.bookingId,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      responseCode,
    };
  }
}