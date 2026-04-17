import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { CinemasModule } from './cinemas/cinemas.module';
import { TheatersModule } from './theaters/theaters.module';
import { SeatsModule } from './seats/seats.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './common/redis/redis.module';
import { TicketsModule } from './tickets/tickets.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ScheduleModule.forRoot(),
    RedisModule,
    RealtimeModule,
    UsersModule,
    MoviesModule,
    CinemasModule,
    TheatersModule,
    SeatsModule,
    SeedModule,
    ShowtimesModule,
    BookingsModule,
    PaymentModule,
    AdminModule,
    TicketsModule,
  ],
})
export class AppModule { }