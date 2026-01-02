/**
 * Payment Service Layer
 * 
 * This service handles payment operations with real Stripe integration.
 * Supports Card, PIX, and Boleto payment methods.
 */

// Types
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  renewalPrice?: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
  hasPlate?: boolean;
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
  isRenewal?: boolean;
  customerEmail?: string;
  customerName?: string;
  customerTaxId?: string; // CPF/CNPJ for Boleto
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
  pixExpiresAt?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  boletoExpiresAt?: string;
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

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// API base URL
const API_BASE_URL = '/api';

// Available plans
const PLANS: Plan[] = [
  {
    id: 'essencial',
    name: 'Memorial Essencial',
    description: 'Ideal para preservar memórias de forma simples e acessível',
    price: 19.90,
    renewalPrice: 19.90,
    currency: 'BRL',
    interval: 'year',
    stripePriceId: 'prod_TiiUFKT7NvAWvA',
    hasPlate: false,
    features: [
      'Página memorial personalizada',
      'Até 10 fotos',
      'Biografia completa',
      'QR Code digital',
      'Compartilhamento em redes sociais',
      'Dedicações ilimitadas'
    ]
  },
  {
    id: 'premium',
    name: 'Memorial Premium',
    description: 'Recursos completos com placa física para homenagens especiais',
    price: 99.90,
    renewalPrice: 29.90,
    currency: 'BRL',
    interval: 'year',
    popular: true,
    stripePriceId: 'prod_Tihb3SipDs4nOP',
    hasPlate: true,
    features: [
      'Tudo do plano Essencial',
      'Fotos ilimitadas',
      'Galeria de vídeos',
      'Árvore genealógica',
      'Placa física com QR Code',
      'Suporte prioritário',
      'Renovação por apenas R$ 29,90/ano'
    ]
  },
  {
    id: 'familia',
    name: 'Plano Família',
    description: 'Para famílias que desejam preservar múltiplas memórias',
    price: 249.90,
    renewalPrice: 59.90,
    currency: 'BRL',
    interval: 'year',
    stripePriceId: 'prod_TiiVZKqHg334zv',
    hasPlate: true,
    features: [
      'Até 5 memoriais Premium',
      'Fotos e vídeos ilimitados',
      'Árvore genealógica conectada',
      'Backup em nuvem',
      'Domínio personalizado',
      '5 placas físicas com QR Code',
      'Suporte VIP 24/7',
      'Renovação por apenas R$ 59,90/ano'
    ]
  }
];

class PaymentService {
  private stripePromise: Promise<any> | null = null;

  /**
   * Load Stripe.js
   */
  private async loadStripe(): Promise<any> {
    if (!this.stripePromise) {
      // Dynamically load Stripe.js
      if (!(window as any).Stripe) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Stripe.js'));
          document.head.appendChild(script);
        });
      }
      this.stripePromise = Promise.resolve((window as any).Stripe(STRIPE_PUBLISHABLE_KEY));
    }
    return this.stripePromise;
  }

  /**
   * Get available plans
   */
  async getPlans(): Promise<Plan[]> {
    return PLANS;
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<Plan | undefined> {
    return PLANS.find(p => p.id === planId);
  }

  /**
   * Get renewal price for a plan
   */
  getRenewalPrice(plan: Plan): number {
    return plan.renewalPrice ?? plan.price;
  }

  /**
   * Create payment intent via backend API
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: data.planId,
          paymentMethodType: data.paymentMethodType,
          memorialId: data.memorialId,
          isRenewal: data.isRenewal,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Erro ao criar intenção de pagamento.',
          error: 'API_ERROR'
        };
      }

      const result = await response.json();
      const plan = await this.getPlanById(data.planId);

      const paymentIntent: PaymentIntent = {
        id: result.id,
        clientSecret: result.client_secret || '',
        amount: result.amount,
        currency: result.currency,
        status: result.status as PaymentIntent['status'],
        paymentMethodType: data.paymentMethodType,
      };

      // Add PIX specific data
      if (data.paymentMethodType === 'pix' && result.pix_qr_code) {
        paymentIntent.pixQrCode = result.pix_qr_code;
        paymentIntent.pixExpiresAt = result.pix_qr_code_expires_at;
      }

      // Add Boleto specific data
      if (data.paymentMethodType === 'boleto') {
        paymentIntent.boletoUrl = result.boleto_url;
        paymentIntent.boletoBarcode = result.boleto_barcode;
        paymentIntent.boletoExpiresAt = result.boleto_expires_at;
      }

      return {
        success: true,
        message: 'Intenção de pagamento criada com sucesso.',
        paymentIntent
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        message: 'Erro ao conectar com o servidor de pagamentos.',
        error: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Process card payment using Stripe.js
   */
  async processCardPayment(paymentIntentId: string, cardData: CardData): Promise<PaymentResponse> {
    try {
      const stripe = await this.loadStripe();
      
      if (!stripe) {
        return {
          success: false,
          message: 'Erro ao carregar sistema de pagamento.',
          error: 'STRIPE_LOAD_ERROR'
        };
      }

      // Get the payment intent to get the client secret
      const intentResponse = await fetch(`${API_BASE_URL}/payments/intent/${paymentIntentId}`);
      const intent = await intentResponse.json();

      if (!intent.client_secret) {
        return {
          success: false,
          message: 'Erro ao obter dados do pagamento.',
          error: 'MISSING_CLIENT_SECRET'
        };
      }

      // Confirm the payment with card details
      const { error, paymentIntent } = await stripe.confirmCardPayment(intent.client_secret, {
        payment_method: {
          card: {
            number: cardData.number.replace(/\s/g, ''),
            exp_month: parseInt(cardData.expMonth),
            exp_year: parseInt(cardData.expYear.length === 2 ? '20' + cardData.expYear : cardData.expYear),
            cvc: cardData.cvc,
          },
          billing_details: {
            name: cardData.holderName,
          },
        },
      });

      if (error) {
        let message = 'Erro ao processar pagamento.';
        if (error.code === 'card_declined') {
          message = 'Cartão recusado. Por favor, tente outro cartão.';
        } else if (error.code === 'insufficient_funds') {
          message = 'Saldo insuficiente.';
        } else if (error.code === 'invalid_card_number') {
          message = 'Número do cartão inválido.';
        } else if (error.code === 'invalid_expiry_month' || error.code === 'invalid_expiry_year') {
          message = 'Data de validade inválida.';
        } else if (error.code === 'invalid_cvc') {
          message = 'Código de segurança inválido.';
        } else if (error.message) {
          message = error.message;
        }

        return {
          success: false,
          message,
          error: error.code || 'PAYMENT_ERROR'
        };
      }

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          message: 'Pagamento realizado com sucesso!',
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: '',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            paymentMethodType: 'card'
          }
        };
      }

      return {
        success: false,
        message: 'Pagamento não foi concluído. Por favor, tente novamente.',
        error: 'PAYMENT_INCOMPLETE'
      };
    } catch (error) {
      console.error('Error processing card payment:', error);
      return {
        success: false,
        message: 'Erro ao processar pagamento. Tente novamente.',
        error: 'PROCESSING_ERROR'
      };
    }
  }

  /**
   * Confirm PIX payment (check status)
   */
  async confirmPixPayment(paymentIntentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/intent/${paymentIntentId}`);
      const intent = await response.json();

      if (intent.status === 'succeeded') {
        return {
          success: true,
          message: 'Pagamento PIX confirmado com sucesso!',
          paymentIntent: {
            id: intent.id,
            clientSecret: '',
            amount: intent.amount,
            currency: intent.currency,
            status: 'succeeded',
            paymentMethodType: 'pix'
          }
        };
      }

      return {
        success: false,
        message: 'Aguardando confirmação do pagamento PIX.',
        error: 'PAYMENT_PENDING'
      };
    } catch (error) {
      console.error('Error confirming PIX payment:', error);
      return {
        success: false,
        message: 'Erro ao verificar pagamento. Tente novamente.',
        error: 'CONFIRMATION_ERROR'
      };
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // TODO: Implement with backend API
    return [];
  }

  /**
   * Get user's subscriptions
   */
  async getSubscriptions(): Promise<Subscription[]> {
    // TODO: Implement with backend API
    return [];
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<PaymentResponse> {
    // TODO: Implement with backend API
    return {
      success: true,
      message: 'Assinatura cancelada. Você ainda terá acesso até o final do período pago.'
    };
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<any[]> {
    // TODO: Implement with backend API
    return [];
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
   * Format renewal info for display
   */
  formatRenewalInfo(plan: Plan): string | null {
    if (!plan.renewalPrice || plan.renewalPrice === plan.price) {
      return null;
    }
    return `Renovação por apenas ${this.formatPrice(plan.renewalPrice)}/ano`;
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

  /**
   * Get Stripe publishable key
   */
  getPublishableKey(): string {
    return STRIPE_PUBLISHABLE_KEY;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export default for convenience
export default paymentService;
