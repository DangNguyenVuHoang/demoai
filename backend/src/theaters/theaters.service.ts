import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';

@Injectable()
export class TheatersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTheaterDto) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id: dto.cinemaId },
    });

    if (!cinema) {
      throw new BadRequestException('Cinema not found');
    }

    const existed = await this.prisma.theater.findFirst({
      where: {
        cinemaId: dto.cinemaId,
        name: dto.name,
      },
    });

    if (existed) {
      throw new BadRequestException('Theater name already exists in this cinema');
    }

    return this.prisma.theater.create({
      data: dto,
      include: {
        cinema: true,
      },
    });
  }

  async findAll() {
    return this.prisma.theater.findMany({
      include: {
        cinema: true,
        seats: true,
        showtimes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const theater = await this.prisma.theater.findUnique({
      where: { id },
      include: {
        cinema: true,
        seats: true,
        showtimes: true,
      },
    });

    if (!theater) {
      throw new NotFoundException('Theater not found');
    }

    return theater;
  }

  async update(id: string, dto: UpdateTheaterDto) {
    await this.findOne(id);

    if (dto.cinemaId) {
      const cinema = await this.prisma.cinema.findUnique({
        where: { id: dto.cinemaId },
      });

      if (!cinema) {
        throw new BadRequestException('Cinema not found');
      }
    }

    return this.prisma.theater.update({
      where: { id },
      data: dto,
      include: {
        cinema: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.theater.delete({
      where: { id },
    });
  }
}