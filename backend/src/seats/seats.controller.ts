import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { BulkCreateSeatsDto } from './dto/bulk-create-seats.dto';

@ApiTags('Seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  create(@Body() dto: CreateSeatDto) {
    return this.seatsService.create(dto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkCreateSeatsDto) {
    return this.seatsService.bulkCreate(dto);
  }

  @Get()
  findAll(@Query('theaterId') theaterId?: string) {
    if (theaterId) {
      return this.seatsService.findByTheater(theaterId);
    }
    return this.seatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seatsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeatDto) {
    return this.seatsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seatsService.remove(id);
  }
}