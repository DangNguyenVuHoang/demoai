import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCinemaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}