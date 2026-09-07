# AmiableBank

A REST API for a digital bank, built with Express and Prisma (PostgreSQL). It handles customer onboarding/KYC, account creation, balances, and money transfers, integrating with NIBSS for interbank name enquiry and transfers.

## Features

- **Auth** — register/login with hashed passwords (bcrypt) and JWT-based sessions.
- **Onboarding** — KYC verification via BVN or NIN.
- **Accounts** — account creation, balance lookup, and interbank name enquiry via NIBSS.
- **Transactions** — money transfers, transfer status, and transaction history.
- Request validation (Zod), rate limiting, `helmet` security headers, and structured request logging.

## Tech stack

- Node.js / Express 5
- PostgreSQL via Prisma ORM
- JWT auth, bcrypt password hashing
- Zod for validation

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database

### Setup

```bash
git clone https://github.com/Christopherdominic/AmiableBank.git
cd AmiableBank
npm install
```

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the server listens on |
| `NODE_ENV` | `development` / `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `1d`) |
| `NIBSS_BASE_URL` | Base URL for the NIBSS API |
| `NIBSS_API_KEY` | NIBSS API key |
| `NIBSS_API_SECRET` | NIBSS API secret |

Run database migrations:

```bash
npx prisma migrate dev
```

Start the server in dev mode:

```bash
npm run dev
```

## API overview

### Auth (`/api/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register a new customer |
| POST | `/login` | Log in and receive a JWT |

### Onboarding (`/api/onboarding`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/` | Submit KYC details (BVN or NIN) |

### Accounts (`/api/accounts`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/` | Create an account for the authenticated customer |
| GET | `/me` | Get the authenticated customer's account |
| GET | `/balance` | Get account balance |
| GET | `/name-enquiry/:accountNumber` | Resolve an account name via NIBSS |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/transfer` | Transfer funds to another account |
| GET | `/history` | List the authenticated customer's transactions |
| GET | `/:transactionId` | Get the status of a transaction |

All routes except `/auth/*` require a `Bearer` JWT in the `Authorization` header.

## Data model

- **Customer** — profile, credentials, KYC info (`bvn`/`nin`).
- **Account** — one per customer, holds `balance` and `accountNumber`.
- **Transaction** — records transfers between accounts, with `pending` / `successful` / `failed` status.

See [prisma/schema.prisma](prisma/schema.prisma) for the full schema.

## Project structure

```
src/
├── config/        # database and NIBSS client config
├── controllers/    # request handlers
├── middlewares/    # auth, validation, error handling, logging
├── routes/         # Express routers
├── services/       # business logic
├── utils/          # shared helpers
└── validators/      # Zod schemas
prisma/
├── schema.prisma   # data model
└── migrations/      # migration history
```

## License

ISC
