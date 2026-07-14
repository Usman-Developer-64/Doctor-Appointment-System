import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY', 'mock_secret_key');
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any, // default API version
    });
  }

  /**
   * Create a Stripe Payment Intent to collect fees on checkout
   */
  async createPaymentIntent(amount: number, currency = 'pkr'): Promise<{ clientSecret: string | null; id: string }> {
    try {
      // Mock payments if Stripe is not configured
      const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!stripeKey || stripeKey === 'mock_secret_key') {
        return {
          clientSecret: 'mock_client_secret_123456',
          id: 'pi_mock_123456',
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // amount in cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Stripe initialization failed');
    }
  }
}
