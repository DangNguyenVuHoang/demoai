import { Injectable } from '@nestjs/common';
import { Prisma, SeatType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async seed() {
    console.log('Seeding database...');

    const movie = await this.prisma.movie.create({
      data: {
        title: 'Avengers: Endgame',
        slug: 'avengers-endgame',
        durationMinutes: 181,
        ageRating: '13+',
        language: 'English',
        subtitle: 'Vietnamese',
        status: 'NOW_SHOWING',
      },
    });

    const cinema = await this.prisma.cinema.create({
      data: {
        name: 'CGV Vincom Dong Khoi',
        brand: 'CGV',
        city: 'Ho Chi Minh',
        address: '72 Le Thanh Ton',
      },
    });

    const theater = await this.prisma.theater.create({
      data: {
        cinemaId: cinema.id,
        name: 'Room 1',
        type: 'TWO_D',
        totalRows: 10,
        totalCols: 12,
        status: true,
      },
    });

    const seats: Prisma.SeatCreateManyInput[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    for (const row of rows) {
      for (let col = 1; col <= 12; col++) {
        seats.push({
          theaterId: theater.id,
          seatRow: row,
          seatNumber: col,
          seatType: SeatType.STANDARD,
          priceModifier: 1,
          status: true,
        });
      }
    }

    await this.prisma.seat.createMany({
      data: seats,
      skipDuplicates: true,
    });

    const showtime = await this.prisma.showtime.create({
      data: {
        movieId: movie.id,
        theaterId: theater.id,
        startTime: new Date('2026-04-11T12:00:00'),
        endTime: new Date('2026-04-11T15:01:00'),
        basePrice: 95000,
        status: 'OPEN',
      },
    });

    return { movie, cinema, theater, showtime };
  }
}