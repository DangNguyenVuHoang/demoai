import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';
import { VNPayService } from './providers/vnpay.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingsModule } from 'src/bookings/bookings.module';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [ConfigModule, BookingsModule, TicketsModule, RealtimeModule],
  controllers: [PaymentController],
  providers: [PaymentService, VNPayService, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule { }