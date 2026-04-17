import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { BulkCreateSeatsDto } from './dto/bulk-create-seats.dto';

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeatDto) {
    const theater = await this.prisma.theater.findUnique({
      where: { id: dto.theaterId },
    });

    if (!theater) {
      throw new BadRequestException('Theater not found');
    }

    const existed = await this.prisma.seat.findFirst({
      where: {
        theaterId: dto.theaterId,
        seatRow: dto.seatRow,
        seatNumber: dto.seatNumber,
      },
    });

    if (existed) {
      throw new BadRequestException('Seat already exists');
    }

    return this.prisma.seat.create({
      data: {
        ...dto,
        seatType: dto.seatType ?? 'STANDARD',
        priceModifier: dto.priceModifier ?? 1,
        status: dto.status ?? true,
      },
    });
  }

  async bulkCreate(dto: BulkCreateSeatsDto) {
    const theater = await this.prisma.theater.findUnique({
      where: { id: dto.theaterId },
    });

    if (!theater) {
      throw new BadRequestException('Theater not found');
    }

    const payload = dto.seats.map((seat) => ({
      theaterId: dto.theaterId,
      seatRow: seat.seatRow,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType ?? 'STANDARD',
      priceModifier: seat.priceModifier ?? 1,
      status: seat.status ?? true,
    }));

    return this.prisma.seat.createMany({
      data: payload,
      skipDuplicates: true,
    });
  }

  async findAll() {
    return this.prisma.seat.findMany({
      include: {
        theater: {
          include: {
            cinema: true,
          },
        },
      },
      orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
    });
  }

  async findByTheater(theaterId: string) {
    return this.prisma.seat.findMany({
      where: { theaterId },
      orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: {
        theater: true,
      },
    });

    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    return seat;
  }

  async update(id: string, dto: UpdateSeatDto) {
    await this.findOne(id);

    if (dto.theaterId) {
      const theater = await this.prisma.theater.findUnique({
        where: { id: dto.theaterId },
      });

      if (!theater) {
        throw new BadRequestException('Theater not found');
      }
    }

    return this.prisma.seat.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.seat.delete({
      where: { id },
    });
  }
}