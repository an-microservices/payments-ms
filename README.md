# Payments Microservice

A NestJS-based microservice for handling payments using Stripe. This service is designed to be part of a larger microservices architecture and provides payment session creation and webhook handling capabilities with NATS-based event-driven communication.

## Features

- **Payment Session Creation**: Create Stripe checkout sessions for processing payments via NATS messaging
- **Webhook Handler**: Process Stripe webhooks for payment events (charge.succeeded)
- **Event Broadcasting**: Emit payment success events to other microservices via NATS
- **Success/Cancel URLs**: Handle payment success and cancellation redirects
- **Microservice Architecture**: NATS-based communication using NestJS microservices
- **Raw Body Handling**: Proper Stripe webhook signature verification with raw request body
- **Environment Validation**: Joi-based configuration validation
- **Input Validation**: Class-validator for DTO validation

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables

```bash
# Create .env file
cp .env.template .env
```

Configure the variables

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Port number for the service | Yes | `3003` |
| `STRIPE_SECRET` | Stripe secret API key | Yes | `sk_test_...` |
| `STRIPE_SUCCESS_URL` | URL to redirect after successful payment | Yes | `http://localhost:3000/payments/success` |
| `STRIPE_CANCEL_URL` | URL to redirect after cancelled payment | Yes | `http://localhost:3000/payments/cancel` |
| `STRIPE_ENDPOINT_SECRET` | Stripe webhook signing secret | Yes | `whsec_...` |
| `NATS_SERVERS` | Comma-separated list of NATS server URLs | Yes | `nats://localhost:4222` |

### Getting Stripe Keys

1. **API Keys**: Get from [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. **Webhook Secret**: 
   - For local development: Use Stripe CLI (`stripe listen --forward-to localhost:3003/payments/webhook`)
   - For production: Get from [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)

## Payment Flow

```
Orders MS → create.payment.session (NATS)
                    ↓
              Payments MS
                    ↓
          Create Stripe Session
                    ↓
     Return Checkout URL to Orders MS
                    ↓
         Customer Pays on Stripe
                    ↓
            Stripe Webhook
                    ↓
     POST /payments/webhook (verify signature)
                    ↓
        Emit payment.succeeded (NATS)
                    ↓
           Orders MS (updates order)
```


## Project Structure

```
src/
├── config/           # Configuration files
│   ├── envs.ts      # Environment variables validation
│   ├── services.ts  # NATS service constants
│   └── index.ts     # Config exports
├── payments/         # Payments module
│   ├── dto/         # Data Transfer Objects
│   │   ├── payment-session.dto.ts
│   │   ├── payment-session-item.dto.ts
│   │   └── index.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── payments.module.ts
├── transports/       # Transport layer
│   └── nats.module.ts  # NATS client configuration
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

## Technologies

- **NestJS**: Progressive Node.js framework
- **Stripe**: Payment processing platform
- **NATS**: Messaging system for microservices communication
- **TypeScript**: Type-safe JavaScript
- **class-validator**: Validation decorators
- **class-transformer**: Object transformation
- **Joi**: Schema validation for environment variables
- **Express**: Underlying HTTP server (with raw body support)

## Architecture

This microservice follows the event-driven microservices pattern:

1. **Hybrid Application**: Combines HTTP server (for webhooks) with NATS microservice transport
2. **Message Patterns**: Synchronous request-response communication
3. **Event Patterns**: Asynchronous event broadcasting
4. **Decoupled Services**: Services communicate only through NATS, not direct HTTP calls

## Useful Commands

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Build for production
npm run build

# Start production build
npm run start:prod

# Run linting
npm run lint

# Format code
npm run format

# Build Docker image (production)
docker build -f dockerfile.prod -t payments-ms:prod .

# Run Docker container
docker run -p 3003:3003 --env-file .env payments-ms:prod

# Stripe CLI - Listen to webhooks locally
stripe listen --forward-to localhost:3003/payments/webhook

# Stripe CLI - Trigger test webhook
stripe trigger payment_intent.succeeded
```

## Docker

### Development Dockerfile
- Hot reload enabled with volume mounts
- Runs `npm run start:dev`

### Production Dockerfile (dockerfile.prod)
- Multi-stage build for smaller image size
- Production dependencies only
- Runs compiled JavaScript with `node dist/main.js`
