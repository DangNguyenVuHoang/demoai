import { SeatType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SeatItemDto {
  @IsString()
  seatRow: string;

  @IsNumber()
  seatNumber: number;

  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @IsOptional()
  @IsNumber()
  priceModifier?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class BulkCreateSeatsDto {
  @IsString()
  theaterId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatItemDto)
  seats: SeatItemDto[];
}