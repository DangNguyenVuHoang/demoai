import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CinemasService } from './cinemas.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@ApiTags('Cinemas')
@Controller('cinemas')
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) {}

  @Post()
  create(@Body() dto: CreateCinemaDto) {
    return this.cinemasService.create(dto);
  }

  @Get()
  findAll() {
    return this.cinemasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cinemasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCinemaDto) {
    return this.cinemasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cinemasService.remove(id);
  }
}