import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TicketStatus, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryMyTicketsDto } from './dto/query-my-tickets.dto';
import { generateTicketCode } from './utils/ticket-code.util';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sinh ticket cho booking đã thanh toán thành công.
   *
   * Business rules:
   * - booking phải tồn tại
   * - booking.status phải là PAID
   * - payment.status phải là SUCCESS
   * - booking phải có bookingSeats
   * - nếu đã có tickets rồi thì không sinh lại
   *
   * Idempotent:
   * - gọi nhiều lần vẫn không sinh trùng ticket
   * - dùng unique [bookingId, seatId] để chặn duplicate ở DB level
   */
  async generateTicketsForBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        bookingSeats: {
          include: {
            seat: true,
          },
        },
        tickets: true,
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
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PAID') {
      throw new ForbiddenException(
        'Tickets can only be generated for PAID bookings',
      );
    }

    if (!booking.payment || booking.payment.status !== 'SUCCESS') {
      throw new ForbiddenException(
        'Tickets can only be generated after successful payment',
      );
    }

    if (!booking.bookingSeats.length) {
      throw new ConflictException('Booking has no seats to generate tickets');
    }

    // Idempotent layer 1: nếu đã có đủ ticket rồi thì trả luôn
    if (booking.tickets.length > 0) {
      return {
        message: 'Tickets already generated',
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        tickets: booking.tickets,
      };
    }

    try {
      const createdTickets = await this.prisma.$transaction(async (tx) => {
        // Idempotent layer 2: check lại trong transaction
        const existingTickets = await tx.ticket.findMany({
          where: { bookingId },
          orderBy: { createdAt: 'asc' },
        });

        if (existingTickets.length > 0) {
          return existingTickets;
        }

        const createInputs: Prisma.TicketCreateManyInput[] = booking.bookingSeats.map(
          (bookingSeat) => {
            const ticketCode = generateTicketCode();

            const qrCodePayload = JSON.stringify({
              ticketCode,
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              userId: booking.userId,
              showtimeId: booking.showtimeId,
              seatId: bookingSeat.seatId,
              issuedAt: new Date().toISOString(),
            });

            return {
              ticketCode,
              bookingId: booking.id,
              userId: booking.userId,
              showtimeId: booking.showtimeId,
              seatId: bookingSeat.seatId,
              price: bookingSeat.priceAtBooking,
              qrCodeData: qrCodePayload,
              status: TicketStatus.ACTIVE,
              issuedAt: new Date(),
            };
          },
        );

        await tx.ticket.createMany({
          data: createInputs,
          skipDuplicates: true,
        });

        return tx.ticket.findMany({
          where: { bookingId },
          orderBy: { createdAt: 'asc' },
        });
      });

      return {
        message: 'Tickets generated successfully',
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        tickets: createdTickets,
      };
    } catch (error: any) {
      // Prisma unique conflict fallback
      if (error?.code === 'P2002') {
        const existingTickets = await this.prisma.ticket.findMany({
          where: { bookingId },
          orderBy: { createdAt: 'asc' },
        });

        return {
          message: 'Tickets already generated',
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          tickets: existingTickets,
        };
      }

      throw error;
    }
  }

  async getMyTickets(userId: string, query: QueryMyTicketsDto) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              {
                ticketCode: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                booking: {
                  bookingCode: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                showtime: {
                  movie: {
                    title: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          booking: true,
          seat: true,
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
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets.map((ticket) => ({
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        price: ticket.price,
        issuedAt: ticket.issuedAt,
        bookingId: ticket.bookingId,
        bookingCode: ticket.booking.bookingCode,
        movieTitle: ticket.showtime.movie.title,
        posterUrl: ticket.showtime.movie.posterUrl,
        cinemaName: ticket.showtime.theater.cinema.name,
        theaterName: ticket.showtime.theater.name,
        startTime: ticket.showtime.startTime,
        endTime: ticket.showtime.endTime,
        seatId: ticket.seatId,
        seatRow: ticket.seat.seatRow,
        seatNumber: ticket.seat.seatNumber,
        seatType: ticket.seat.seatType,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketDetail(ticketId: string, userId: string, userRole?: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
        seat: true,
        booking: {
          include: {
            payment: true,
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
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const isOwner = ticket.userId === userId;
    const isAdminOrStaff =
      userRole === UserRole.ADMIN || userRole === UserRole.STAFF;

    if (!isOwner && !isAdminOrStaff) {
      throw new ForbiddenException(
        'You do not have permission to view this ticket',
      );
    }

    return {
      id: ticket.id,
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      price: ticket.price,
      qrCodeData: ticket.qrCodeData,
      issuedAt: ticket.issuedAt,
      usedAt: ticket.usedAt,
      owner: {
        id: ticket.user.id,
        fullName: ticket.user.fullName,
        email: ticket.user.email,
      },
      booking: {
        id: ticket.booking.id,
        bookingCode: ticket.booking.bookingCode,
        status: ticket.booking.status,
        totalAmount: ticket.booking.totalAmount,
        expiredAt: ticket.booking.expiredAt,
      },
      payment: ticket.booking.payment
        ? {
            id: ticket.booking.payment.id,
            provider: ticket.booking.payment.provider,
            transactionRef: ticket.booking.payment.transactionRef,
            gatewayTransactionId: ticket.booking.payment.gatewayTransactionId,
            amount: ticket.booking.payment.amount,
            status: ticket.booking.payment.status,
            paidAt: ticket.booking.payment.paidAt,
          }
        : null,
      movie: {
        id: ticket.showtime.movie.id,
        title: ticket.showtime.movie.title,
        posterUrl: ticket.showtime.movie.posterUrl,
        durationMinutes: ticket.showtime.movie.durationMinutes,
        ageRating: ticket.showtime.movie.ageRating,
      },
      cinema: {
        id: ticket.showtime.theater.cinema.id,
        name: ticket.showtime.theater.cinema.name,
        address: ticket.showtime.theater.cinema.address,
        city: ticket.showtime.theater.cinema.city,
      },
      theater: {
        id: ticket.showtime.theater.id,
        name: ticket.showtime.theater.name,
        type: ticket.showtime.theater.type,
      },
      showtime: {
        id: ticket.showtime.id,
        startTime: ticket.showtime.startTime,
        endTime: ticket.showtime.endTime,
      },
      seat: {
        id: ticket.seat.id,
        seatRow: ticket.seat.seatRow,
        seatNumber: ticket.seat.seatNumber,
        seatType: ticket.seat.seatType,
      },
    };
  }

  async getTicketsByBooking(
    bookingId: string,
    userId: string,
    userRole?: UserRole,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tickets: {
          include: {
            seat: true,
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
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const isOwner = booking.userId === userId;
    const isAdminOrStaff =
      userRole === UserRole.ADMIN || userRole === UserRole.STAFF;

    if (!isOwner && !isAdminOrStaff) {
      throw new ForbiddenException(
        'You do not have permission to view tickets of this booking',
      );
    }

    return {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      bookingStatus: booking.status,
      tickets: booking.tickets.map((ticket) => ({
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        price: ticket.price,
        issuedAt: ticket.issuedAt,
        seat: {
          id: ticket.seat.id,
          seatRow: ticket.seat.seatRow,
          seatNumber: ticket.seat.seatNumber,
          seatType: ticket.seat.seatType,
        },
        movie: {
          id: ticket.showtime.movie.id,
          title: ticket.showtime.movie.title,
          posterUrl: ticket.showtime.movie.posterUrl,
        },
        showtime: {
          id: ticket.showtime.id,
          startTime: ticket.showtime.startTime,
          endTime: ticket.showtime.endTime,
        },
        theater: {
          id: ticket.showtime.theater.id,
          name: ticket.showtime.theater.name,
        },
        cinema: {
          id: ticket.showtime.theater.cinema.id,
          name: ticket.showtime.theater.cinema.name,
        },
      })),
    };
  }

  async markTicketUsed(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new ConflictException('Only ACTIVE ticket can be marked as USED');
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.USED,
        usedAt: new Date(),
      },
    });
  }

  async cancelTicketsByBooking(bookingId: string) {
    return this.prisma.ticket.updateMany({
      where: {
        bookingId,
        status: TicketStatus.ACTIVE,
      },
      data: {
        status: TicketStatus.CANCELLED,
      },
    });
  }

  async refundTicketsByBooking(bookingId: string) {
    return this.prisma.ticket.updateMany({
      where: {
        bookingId,
      },
      data: {
        status: TicketStatus.REFUNDED,
      },
    });
  }
}