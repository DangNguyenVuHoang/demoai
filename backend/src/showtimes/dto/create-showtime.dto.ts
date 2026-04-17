import { ShowtimeStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateShowtimeDto {
  @IsString()
  movieId: string;

  @IsString()
  theaterId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsEnum(ShowtimeStatus)
  status?: ShowtimeStatus;
}