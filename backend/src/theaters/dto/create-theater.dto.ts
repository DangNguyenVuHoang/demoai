import { TheaterType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsString, Min } from 'class-validator';

export class CreateTheaterDto {
  @IsString()
  cinemaId: string;

  @IsString()
  name: string;

  @IsEnum(TheaterType)
  type: TheaterType;

  @IsInt()
  @Min(1)
  totalRows: number;

  @IsInt()
  @Min(1)
  totalCols: number;

  @IsBoolean()
  status: boolean;
}