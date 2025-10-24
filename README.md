# Payments Microservice

A NestJS-based microservice for handling payments using Stripe. This service is designed to be part of a larger microservices architecture and provides payment session creation and webhook handling capabilities.

## Features

- **Payment Session Creation**: Create Stripe checkout sessions for processing payments
- **Webhook Handler**: Process Stripe webhooks for payment events
- **Success/Cancel URLs**: Handle payment success and cancellation redirects
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

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Port number for the service | Yes |
| `STRIPE_SECRET` | Stripe secret API key | Yes |
| `STRIPE_SUCCESS_URL` | URL to redirect after successful payment | Yes |
| `STRIPE_CANCEL_URL` | URL to redirect after cancelled payment | Yes |
| `STRIPE_ENDPOINT_SECRET` | Stripe webhook signing secret | Yes |


## Project Structure

```
src/
├── config/           # Configuration files
│   ├── envs.ts      # Environment variables validation
│   └── index.ts     # Config exports
├── payments/         # Payments module
│   ├── dto/         # Data Transfer Objects
│   │   ├── payment-session.dto.ts
│   │   ├── payment-session-item.dto.ts
│   │   └── index.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── payments.module.ts
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

## Technologies

- **NestJS**: Progressive Node.js framework
- **Stripe**: Payment processing platform
- **TypeScript**: Type-safe JavaScript
- **class-validator**: Validation decorators
- **class-transformer**: Object transformation
- **Joi**: Schema validation for environment variables
