import { SeatType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSeatDto {
  @IsString()
  theaterId: string;

  @IsString()
  seatRow: string;

  @IsNumber()
  @Min(1)
  seatNumber: number;

  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceModifier?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}