import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryMyTicketsDto } from './dto/query-my-tickets.dto';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my tickets' })
  @Get('my')
  getMyTickets(@Req() req: any, @Query() query: QueryMyTicketsDto) {
    return this.ticketsService.getMyTickets(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all tickets by booking id' })
  @Get('booking/:bookingId')
  getTicketsByBooking(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.ticketsService.getTicketsByBooking(
      bookingId,
      req.user.id,
      req.user.role as UserRole,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get ticket detail' })
  @Get(':ticketId')
  getTicketDetail(@Req() req: any, @Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketDetail(
      ticketId,
      req.user.id,
      req.user.role as UserRole,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark ticket as used (for admin/staff use later)' })
  @Patch(':ticketId/use')
  markTicketUsed(@Param('ticketId') ticketId: string) {
    return this.ticketsService.markTicketUsed(ticketId);
  }
}