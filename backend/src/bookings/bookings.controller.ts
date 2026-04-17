import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Get all bookings' })
  @Get('bookings')
  findAll() {
    return this.bookingsService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @UseGuards(JwtAuthGuard)
  @Get('bookings/me')
  findMyBookings(@Req() req: any) {
    return this.bookingsService.findMyBookings(req.user.id);
  }

  @ApiOperation({ summary: 'Get booking detail by id' })
  @Get('bookings/:id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update booking status' })
  @Patch('bookings/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User cancels their own booking' })
  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:id/cancel')
  cancelMyBooking(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancelMyBooking(id, req.user.id);
  }

  @ApiOperation({ summary: 'Expire a booking manually' })
  @Patch('bookings/:id/expire')
  expireBooking(@Param('id') id: string) {
    return this.bookingsService.expireBooking(id);
  }

  @ApiOperation({ summary: 'Get seat map by showtime id' })
  @Get('showtimes/:id/seats')
  getShowtimeSeatMap(@Param('id') id: string) {
    return this.bookingsService.getShowtimeSeatMap(id);
  }
}