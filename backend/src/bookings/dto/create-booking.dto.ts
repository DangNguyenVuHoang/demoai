import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  showtimeId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seatIds: string[];
}