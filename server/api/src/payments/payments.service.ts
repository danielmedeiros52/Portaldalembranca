import { Injectable, Logger } from '../framework/nest-like';

interface PaymentIntentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');
  private readonly stripeSecret = process.env.STRIPE_SECRET_KEY;

  async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntentResponse> {
    this.logger.log(`Creating payment intent for ${amount} ${currency}`);

    if (!this.stripeSecret) {
      return {
        id: 'pi_mock',
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: 'pi_mock_secret',
      };
    }

    const body = new URLSearchParams({
      amount: Math.round(amount).toString(),
      currency,
      'automatic_payment_methods[enabled]': 'true',
    });

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Stripe request failed: ${response.status} ${details}`);
    }

    return (await response.json()) as PaymentIntentResponse;
  }
}
