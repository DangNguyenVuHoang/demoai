import { Body, Controller, Get, Ip, Post, Query } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Ip() ip: string,
  ) {
    const clientIp = ip === '::1' ? '127.0.0.1' : ip;
    return this.paymentService.createPayment(createPaymentDto, clientIp);
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: Record<string, any>) {
    return this.paymentService.handleVNPayReturn(query);
  }
}