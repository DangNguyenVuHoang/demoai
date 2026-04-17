import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@Injectable()
export class CinemasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCinemaDto) {
    const existed = await this.prisma.cinema.findFirst({
      where: {
        name: dto.name,
        city: dto.city,
        address: dto.address,
      },
    });

    if (existed) {
      throw new BadRequestException('Cinema already exists');
    }

    return this.prisma.cinema.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.cinema.findMany({
      include: {
        theaters: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id },
      include: {
        theaters: true,
      },
    });

    if (!cinema) {
      throw new NotFoundException('Cinema not found');
    }

    return cinema;
  }

  async update(id: string, dto: UpdateCinemaDto) {
    await this.findOne(id);

    return this.prisma.cinema.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.cinema.delete({
      where: { id },
    });
  }
}