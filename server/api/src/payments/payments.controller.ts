import { BadRequestException, Body, Controller, Post } from '../framework/nest-like';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService = new PaymentsService()) {}

  @Post('intent')
  async createPaymentIntent(@Body() payload: CreatePaymentIntentDto) {
    const { amount, currency } = payload;

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive number');
    }

    const safeCurrency = currency ?? 'usd';

    return this.paymentsService.createPaymentIntent(amount, safeCurrency);
  }
}
