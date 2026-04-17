import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMovieDto) {
    const existed = await this.prisma.movie.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { title: dto.title }],
      },
    });

    if (existed) {
      throw new BadRequestException('Movie title or slug already exists');
    }

    return this.prisma.movie.create({
      data: {
        ...dto,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async update(id: string, dto: UpdateMovieDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existedSlug = await this.prisma.movie.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (existedSlug) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.prisma.movie.update({
      where: { id },
      data: {
        ...dto,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.movie.delete({
      where: { id },
    });
  }
}