import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('create.payment.session')
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment succesful',
    };
  }

  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment cancelled',
    };
  }

  @Post('webhook')
  stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhookHandler(req, res);
  }
}
