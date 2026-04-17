import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { SeatLockService } from './seat-lock.service';
import { SeatMapGateway } from '../realtime/seat-map.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seatLockService: SeatLockService,
    private readonly seatMapGateway: SeatMapGateway, // 👈 thêm dòng này
  ) { }

  private generateBookingCode(): string {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `BK${Date.now()}${random}`;
  }

  private formatSeatLabel(seatRow: string, seatNumber: number): string {
    return `${seatRow}${seatNumber}`;
  }

  async create(userId: string, dto: CreateBookingDto) {
    const { showtimeId, seatIds } = dto;

    const uniqueSeatIds = [...new Set(seatIds)];

    if (uniqueSeatIds.length !== seatIds.length) {
      throw new BadRequestException('Duplicate seatIds are not allowed');
    }

    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: true,
        theater: {
          include: {
            cinema: true,
          },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }

    if (showtime.status === 'CLOSED' || showtime.status === 'CANCELLED') {
      throw new BadRequestException(
        `Cannot book this showtime because it is ${showtime.status.toLowerCase()}`,
      );
    }

    const now = new Date();

    if (showtime.startTime <= now) {
      throw new BadRequestException(
        'Cannot book a showtime that has already started',
      );
    }

    const seats = await this.prisma.seat.findMany({
      where: {
        id: { in: uniqueSeatIds },
        theaterId: showtime.theaterId,
        status: true,
      },
      orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
    });

    if (seats.length !== uniqueSeatIds.length) {
      throw new BadRequestException(
        'One or more seats are invalid, inactive, or do not belong to this theater',
      );
    }

    const blockedSeatRecords = await this.prisma.bookingSeat.findMany({
      where: {
        seatId: { in: uniqueSeatIds },
        booking: {
          showtimeId,
          OR: [
            {
              status: BookingStatus.PAID,
            },
            {
              status: BookingStatus.HOLDING,
              OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
            },
            {
              status: BookingStatus.PENDING,
              OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
            },
          ],
        },
      },
      include: {
        seat: true,
        booking: true,
      },
    });

    if (blockedSeatRecords.length > 0) {
      const blockedSeatLabels = blockedSeatRecords.map((item) =>
        this.formatSeatLabel(item.seat.seatRow, item.seat.seatNumber),
      );

      throw new ConflictException(
        `Some seats are already being held or booked: ${blockedSeatLabels.join(', ')}`,
      );
    }

    console.log('STEP 1 - before redis lock', {
      showtimeId,
      uniqueSeatIds,
    });

    await this.seatLockService.lockSeats(showtimeId, uniqueSeatIds);

    console.log('STEP 2 - after redis lock');

    const seatPriceMap = seats.map((seat) => ({
      seatId: seat.id,
      seatRow: seat.seatRow,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      priceAtBooking:
        Number(showtime.basePrice) + Number(seat.priceModifier ?? 0),
    }));

    const totalAmount = seatPriceMap.reduce(
      (sum, item) => sum + item.priceAtBooking,
      0,
    );

    const bookingCode = this.generateBookingCode();
    // Tính expiredAt trùng với TTL của Redis để đảm bảo đồng bộ
    // Nếu TTL của Redis là 5 phút, thì expiredAt cũng nên là 5 phút để tránh trường hợp booking đã bị Redis tự động release nhưng expiredAt vẫn còn thời 
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

    console.log('STEP 3 - before transaction', {
      bookingCode,
      totalAmount,
      expiredAt,
    });

    try {
      const createdBooking = await this.prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            userId,
            showtimeId,
            bookingCode,
            totalAmount,
            status: BookingStatus.HOLDING,
            expiredAt,
          },
        });

        console.log('STEP 4 - booking created', booking.id);

        await tx.bookingSeat.createMany({
          data: seatPriceMap.map((item) => ({
            bookingId: booking.id,
            seatId: item.seatId,
            priceAtBooking: item.priceAtBooking,
          })),
        });

        console.log('STEP 5 - booking seats created');

        return tx.booking.findUnique({
          where: { id: booking.id },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
            showtime: {
              include: {
                movie: true,
                theater: {
                  include: {
                    cinema: true,
                  },
                },
              },
            },
            bookingSeats: {
              include: {
                seat: true,
              },
            },
            payment: true,
          },
        });
      });

      console.log('STEP 6 - transaction success');

      if (!createdBooking) {
        throw new Error('Failed to create booking');
      }

      // 🔥 emit realtime
      this.seatMapGateway.emitSeatMapUpdated(showtimeId, {
        action: 'BOOKING_CREATED',
        seatIds: uniqueSeatIds,
        bookingId: createdBooking.id,
      });


      return createdBooking;
    } catch (error) {
      console.error('CREATE BOOKING ERROR:', error);

      try {
        await this.seatLockService.releaseSeats(showtimeId, uniqueSeatIds);
        console.log('STEP 7 - redis lock released after failure');
      } catch (releaseError) {
        console.error('RELEASE LOCK ERROR:', releaseError);
      }

      throw error;
    }
  }

  async findAll() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        showtime: {
          include: {
            movie: true,
            theater: {
              include: {
                cinema: true,
              },
            },
          },
        },
        bookingSeats: {
          include: {
            seat: true,
          },
        },
        payment: true,
      },
    });
  }

  async findMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        showtime: {
          include: {
            movie: true,
            theater: {
              include: {
                cinema: true,
              },
            },
          },
        },
        bookingSeats: {
          include: {
            seat: true,
          },
        },
        payment: true,
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        showtime: {
          include: {
            movie: true,
            theater: {
              include: {
                cinema: true,
              },
            },
          },
        },
        bookingSeats: {
          include: {
            seat: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        payment: true,
      },
    });

    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      existingBooking.status === BookingStatus.CANCELLED ||
      existingBooking.status === BookingStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Cannot update status because booking is already ${existingBooking.status.toLowerCase()}`,
      );
    }

    if (
      dto.status === BookingStatus.PAID &&
      existingBooking.payment &&
      existingBooking.payment.status !== 'SUCCESS'
    ) {
      throw new BadRequestException(
        'Cannot mark booking as PAID because payment status is not SUCCESS',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        showtime: {
          include: {
            movie: true,
            theater: {
              include: {
                cinema: true,
              },
            },
          },
        },
        bookingSeats: {
          include: {
            seat: true,
          },
        },
        payment: true,
      },
    });
  }

  async cancelMyBooking(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        payment: true,
        bookingSeats: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ConflictException(
        'You are not allowed to cancel this booking',
      );
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Booking is already ${booking.status.toLowerCase()}`,
      );
    }

    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException(
        'Paid booking cannot be cancelled from this endpoint',
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
      include: {
        showtime: {
          include: {
            movie: true,
            theater: {
              include: {
                cinema: true,
              },
            },
          },
        },
        bookingSeats: {
          include: {
            seat: true,
          },
        },
        payment: true,
      },
    });

    await this.seatLockService.releaseSeats(
      booking.showtimeId,
      booking.bookingSeats.map((s) => s.seatId),
    );

    this.seatMapGateway.emitSeatMapUpdated(booking.showtimeId, {
      action: 'BOOKING_CANCELLED',
      seatIds: booking.bookingSeats.map((s) => s.seatId),
      bookingId: booking.id,
    });

    return updatedBooking;
  }

  async getShowtimeSeatMap(showtimeId: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: true,
        theater: {
          include: {
            cinema: true,
            seats: {
              where: {
                status: true,
              },
              orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
            },
          },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }

    const now = new Date();

    const blockedBookingSeats = await this.prisma.bookingSeat.findMany({
      where: {
        booking: {
          showtimeId,
          OR: [
            {
              status: BookingStatus.PAID,
            },
            {
              status: BookingStatus.HOLDING,
              OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
            },
            {
              status: BookingStatus.PENDING,
              OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
            },
          ],
        },
      },
      select: {
        seatId: true,
      },
    });

    const blockedSeatIdSet = new Set(
      blockedBookingSeats.map((item) => item.seatId),
    );

    const seats = await Promise.all(
      showtime.theater.seats.map(async (seat) => {
        const isLocked = await this.seatLockService.isSeatLocked(
          showtimeId,
          seat.id,
        );

        return {
          id: seat.id,
          seatRow: seat.seatRow,
          seatNumber: seat.seatNumber,
          seatType: seat.seatType,
          priceModifier: seat.priceModifier,
          status: seat.status,
          label: this.formatSeatLabel(seat.seatRow, seat.seatNumber),
          isBooked: blockedSeatIdSet.has(seat.id) || isLocked,
          finalPrice:
            Number(showtime.basePrice) + Number(seat.priceModifier ?? 0),
        };
      }),
    );

    return {
      showtime: {
        id: showtime.id,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        basePrice: showtime.basePrice,
        status: showtime.status,
      },
      movie: {
        id: showtime.movie.id,
        title: showtime.movie.title,
        slug: showtime.movie.slug,
        posterUrl: showtime.movie.posterUrl,
        durationMinutes: showtime.movie.durationMinutes,
      },
      cinema: {
        id: showtime.theater.cinema.id,
        name: showtime.theater.cinema.name,
        city: showtime.theater.cinema.city,
        address: showtime.theater.cinema.address,
      },
      theater: {
        id: showtime.theater.id,
        name: showtime.theater.name,
        type: showtime.theater.type,
        totalRows: showtime.theater.totalRows,
        totalCols: showtime.theater.totalCols,
      },
      seats,
    };
  }

  async expireBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        bookingSeats: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('Paid booking cannot be expired');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.EXPIRED,
      },
    });

    await this.seatLockService.releaseSeats(
      booking.showtimeId,
      booking.bookingSeats.map((s) => s.seatId),
    );
    this.seatMapGateway.emitSeatMapUpdated(booking.showtimeId, {
      action: 'BOOKING_EXPIRED',
      seatIds: booking.bookingSeats.map((s) => s.seatId),
      bookingId: booking.id,
    });
    return updatedBooking;
  }
}