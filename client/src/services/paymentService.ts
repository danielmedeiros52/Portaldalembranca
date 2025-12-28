/**
 * Payment Service Layer
 * 
 * This service handles payment operations with mocked API responses.
 * Structured for easy integration with Stripe.
 * 
 * To integrate with Stripe:
 * 1. Install @stripe/stripe-js and @stripe/react-stripe-js
 * 2. Replace mock responses with actual Stripe API calls
 * 3. Implement webhook handlers on the backend
 */

// Types
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
  popular?: boolean;
  stripePriceId?: string; // For Stripe integration
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'pix' | 'boleto';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface CreatePaymentIntentData {
  planId: string;
  paymentMethodType: 'card' | 'pix' | 'boleto';
  memorialId?: number;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  paymentMethodType: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  expiresAt?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentIntent?: PaymentIntent;
  subscription?: Subscription;
  error?: string;
}

export interface CardData {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holderName: string;
}

// Simulated delay to mimic API latency
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Available plans
const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Memorial Básico',
    description: 'Ideal para preservar memórias essenciais',
    price: 0,
    currency: 'BRL',
    interval: 'one_time',
    features: [
      'Página memorial personalizada',
      'Até 5 fotos',
      'Biografia básica',
      'QR Code digital',
      'Compartilhamento em redes sociais'
    ]
  },
  {
    id: 'premium',
    name: 'Memorial Premium',
    description: 'Recursos completos para homenagens especiais',
    price: 99.90,
    currency: 'BRL',
    interval: 'one_time',
    popular: true,
    stripePriceId: 'price_premium_memorial',
    features: [
      'Tudo do plano Básico',
      'Fotos ilimitadas',
      'Galeria de vídeos',
      'Árvore genealógica',
      'Dedicações ilimitadas',
      'Placa física com QR Code',
      'Suporte prioritário'
    ]
  },
  {
    id: 'family',
    name: 'Plano Família',
    description: 'Para famílias que desejam preservar múltiplas memórias',
    price: 249.90,
    currency: 'BRL',
    interval: 'year',
    stripePriceId: 'price_family_annual',
    features: [
      'Até 5 memoriais Premium',
      'Fotos e vídeos ilimitados',
      'Árvore genealógica conectada',
      'Backup em nuvem',
      'Domínio personalizado',
      '5 placas físicas com QR Code',
      'Suporte VIP 24/7'
    ]
  }
];

class PaymentService {
  /**
   * Get available plans
   * GET /api/payments/plans
   */
  async getPlans(): Promise<Plan[]> {
    await simulateDelay(300);

    // TODO: Replace with actual API call
    // return fetch('/api/payments/plans').then(r => r.json());

    return PLANS;
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<Plan | undefined> {
    const plans = await this.getPlans();
    return plans.find(p => p.id === planId);
  }

  /**
   * Create payment intent
   * POST /api/payments/create-intent
   * 
   * This will be replaced with Stripe's createPaymentIntent
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentResponse> {
    await simulateDelay(1000);

    // TODO: Replace with actual Stripe API call
    // return fetch('/api/payments/create-intent', {
    //   method: 'POST',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    const plan = await this.getPlanById(data.planId);
    
    if (!plan) {
      return {
        success: false,
        message: 'Plano não encontrado.',
        error: 'PLAN_NOT_FOUND'
      };
    }

    const paymentIntent: PaymentIntent = {
      id: 'pi_mock_' + Date.now(),
      clientSecret: 'pi_mock_secret_' + Date.now(),
      amount: plan.price * 100, // Stripe uses cents
      currency: plan.currency.toLowerCase(),
      status: 'requires_payment_method',
      paymentMethodType: data.paymentMethodType
    };

    // Add PIX specific data
    if (data.paymentMethodType === 'pix') {
      paymentIntent.pixQrCode = '00020126580014br.gov.bcb.pix0136mock-pix-key-portal-da-lembranca';
      paymentIntent.pixQrCodeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      paymentIntent.expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
    }

    // Add Boleto specific data
    if (data.paymentMethodType === 'boleto') {
      paymentIntent.boletoUrl = 'https://mock-boleto-url.com/boleto/123456';
      paymentIntent.boletoBarcode = '23793.38128 60000.000003 00000.000400 1 84340000009990';
      paymentIntent.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
    }

    return {
      success: true,
      message: 'Intenção de pagamento criada com sucesso.',
      paymentIntent
    };
  }

  /**
   * Process card payment
   * POST /api/payments/process-card
   */
  async processCardPayment(paymentIntentId: string, cardData: CardData): Promise<PaymentResponse> {
    await simulateDelay(2000);

    // TODO: Replace with actual Stripe confirmCardPayment
    // const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
    // const result = await stripe.confirmCardPayment(clientSecret, {
    //   payment_method: { card: cardElement }
    // });

    // Validate card number (basic validation)
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return {
        success: false,
        message: 'Número do cartão inválido.',
        error: 'INVALID_CARD_NUMBER'
      };
    }

    // Mock: Simulate declined card
    if (cardNumber.endsWith('0000')) {
      return {
        success: false,
        message: 'Cartão recusado. Por favor, tente outro cartão.',
        error: 'CARD_DECLINED'
      };
    }

    // Mock: Simulate insufficient funds
    if (cardNumber.endsWith('9999')) {
      return {
        success: false,
        message: 'Saldo insuficiente.',
        error: 'INSUFFICIENT_FUNDS'
      };
    }

    return {
      success: true,
      message: 'Pagamento realizado com sucesso!',
      paymentIntent: {
        id: paymentIntentId,
        clientSecret: '',
        amount: 0,
        currency: 'brl',
        status: 'succeeded',
        paymentMethodType: 'card'
      }
    };
  }

  /**
   * Confirm PIX payment
   * POST /api/payments/confirm-pix
   */
  async confirmPixPayment(paymentIntentId: string): Promise<PaymentResponse> {
    await simulateDelay(1500);

    // TODO: Replace with actual webhook handler
    // PIX confirmation usually comes via webhook from Stripe

    return {
      success: true,
      message: 'Pagamento PIX confirmado com sucesso!',
      paymentIntent: {
        id: paymentIntentId,
        clientSecret: '',
        amount: 0,
        currency: 'brl',
        status: 'succeeded',
        paymentMethodType: 'pix'
      }
    };
  }

  /**
   * Get user's payment methods
   * GET /api/payments/methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await simulateDelay(500);

    // TODO: Replace with actual Stripe API call
    // return fetch('/api/payments/methods', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // }).then(r => r.json());

    // Mock payment methods
    return [
      {
        id: 'pm_mock_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];
  }

  /**
   * Get user's subscriptions
   * GET /api/payments/subscriptions
   */
  async getSubscriptions(): Promise<Subscription[]> {
    await simulateDelay(500);

    // TODO: Replace with actual Stripe API call

    return [];
  }

  /**
   * Cancel subscription
   * POST /api/payments/subscriptions/:id/cancel
   */
  async cancelSubscription(subscriptionId: string): Promise<PaymentResponse> {
    await simulateDelay();

    // TODO: Replace with actual Stripe API call

    return {
      success: true,
      message: 'Assinatura cancelada. Você ainda terá acesso até o final do período pago.'
    };
  }

  /**
   * Get payment history
   * GET /api/payments/history
   */
  async getPaymentHistory(): Promise<any[]> {
    await simulateDelay(500);

    // TODO: Replace with actual API call

    return [
      {
        id: 'pay_mock_1',
        amount: 99.90,
        currency: 'BRL',
        status: 'succeeded',
        description: 'Memorial Premium - Maria Silva Santos',
        createdAt: '2024-12-15T10:30:00Z',
        paymentMethod: 'Visa •••• 4242'
      }
    ];
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get card brand icon name
   */
  getCardBrandIcon(brand: string): string {
    const brands: Record<string, string> = {
      visa: 'visa',
      mastercard: 'mastercard',
      amex: 'amex',
      elo: 'elo',
      hipercard: 'hipercard'
    };
    return brands[brand.toLowerCase()] || 'card';
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export default for convenience
export default paymentService;
