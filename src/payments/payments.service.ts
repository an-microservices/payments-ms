import { Request, Response } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';
import { envs, NATS_SERVICE } from '../config';
import { PaymentSessionDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccesUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return {
      cancelUrl: session.cancel_url,
      succesUrl: session.success_url,
      url: session.url,
    };
  }

  stripeWebhookHandler(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    const endpointSecret = envs.stripeEndpointSecret;
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig!,
        endpointSecret,
      );
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded': {
        const chargeSucceded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceded.id,
          orderId: chargeSucceded.metadata.orderId,
          receiptUrl: chargeSucceded.receipt_url,
        };

        this.client.emit('payment.succeeded', payload);
        break;
      }

      default:
        console.log(`Event not handled: ${event.type}`);
    }

    res.status(200).send({ sig });
    return;
  }
}
