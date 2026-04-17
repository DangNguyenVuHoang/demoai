import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Injectable()
export class ShowtimesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShowtimeDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
    });

    if (!movie) {
      throw new BadRequestException('Movie not found');
    }

    const theater = await this.prisma.theater.findUnique({
      where: { id: dto.theaterId },
    });

    if (!theater) {
      throw new BadRequestException('Theater not found');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be greater than start time');
    }

    const overlapped = await this.prisma.showtime.findFirst({
      where: {
        theaterId: dto.theaterId,
        NOT: [
          {
            endTime: { lte: startTime },
          },
          {
            startTime: { gte: endTime },
          },
        ],
      },
    });

    if (overlapped) {
      throw new BadRequestException('Showtime overlaps with existing showtime');
    }

    return this.prisma.showtime.create({
      data: {
        movieId: dto.movieId,
        theaterId: dto.theaterId,
        startTime,
        endTime,
        basePrice: dto.basePrice,
        status: dto.status ?? 'SCHEDULED',
      },
      include: {
        movie: true,
        theater: {
          include: {
            cinema: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.showtime.findMany({
      include: {
        movie: true,
        theater: {
          include: {
            cinema: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        theater: {
          include: {
            cinema: true,
            seats: true,
          },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }

    return showtime;
  }

  async update(id: string, dto: UpdateShowtimeDto) {
    const current = await this.findOne(id);

    const movieId = dto.movieId ?? current.movieId;
    const theaterId = dto.theaterId ?? current.theaterId;
    const startTime = dto.startTime ? new Date(dto.startTime) : current.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : current.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be greater than start time');
    }

    const overlapped = await this.prisma.showtime.findFirst({
      where: {
        theaterId,
        id: { not: id },
        AND: [
          {
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
          },
        ],
      },
    });

    if (overlapped) {
      throw new BadRequestException('Updated showtime overlaps with existing showtime');
    }

    return this.prisma.showtime.update({
      where: { id },
      data: {
        movieId,
        theaterId,
        startTime,
        endTime,
        basePrice: dto.basePrice ?? current.basePrice,
        status: dto.status ?? current.status,
      },
      include: {
        movie: true,
        theater: {
          include: {
            cinema: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.showtime.delete({
      where: { id },
    });
  }
}