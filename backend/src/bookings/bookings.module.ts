import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SeatLockService } from './seat-lock.service';
import { BookingExpirationService } from './booking-expiration.service';

import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    PrismaService,
    SeatLockService,
    BookingExpirationService,
  ],
  exports: [BookingsService, SeatLockService],
})
export class BookingsModule {}