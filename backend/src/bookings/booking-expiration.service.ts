import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SeatLockService } from './seat-lock.service';
import { SeatMapGateway } from '../realtime/seat-map.gateway';

@Injectable()
export class BookingExpirationService {
  private readonly logger = new Logger(BookingExpirationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seatLockService: SeatLockService,
    private readonly seatMapGateway: SeatMapGateway,
  ) {}

  @Cron('*/30 * * * * *')
  async handleExpiredBookings() {
    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.HOLDING,
        expiredAt: {
          lte: now,
        },
      },
      include: {
        bookingSeats: true,
      },
    });

    if (expiredBookings.length === 0) {
      return;
    }

    for (const booking of expiredBookings) {
      try {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.EXPIRED,
          },
        });

        await this.seatLockService.releaseSeats(
          booking.showtimeId,
          booking.bookingSeats.map((item) => item.seatId),
        );

        this.seatMapGateway.emitSeatMapUpdated(booking.showtimeId, {
          action: 'BOOKING_EXPIRED_BY_CRON',
          seatIds: booking.bookingSeats.map((item) => item.seatId),
          bookingId: booking.id,
        });

        this.logger.log(`Expired booking released: ${booking.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to expire booking ${booking.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}