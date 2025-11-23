# IVR Builder Backend API

Production-ready backend API for the IVR Builder system.

## Features

- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Prisma ORM
- ✅ JWT authentication and authorization
- ✅ Multi-tenant support (organizations)
- ✅ Twilio telephony integration
- ✅ Webhook handling for call events
- ✅ Workflow execution engine
- ✅ Call recording and transcription
- ✅ Analytics and reporting
- ✅ Phone number management

## Setup

### Prerequisites

- Node.js 22.12.0
- PostgreSQL database
- Twilio account (for telephony features)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed database
pnpm db:seed
```

4. Start development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Workflows
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `POST /api/workflows/:id/deploy` - Deploy workflow to Twilio
- `DELETE /api/workflows/:id` - Delete workflow

### Calls
- `GET /api/calls` - List calls
- `GET /api/calls/:id` - Get call details
- `POST /api/calls` - Make outbound call

### Phone Numbers
- `GET /api/phone-numbers` - List phone numbers
- `POST /api/phone-numbers/purchase` - Purchase phone number
- `PUT /api/phone-numbers/:id` - Update phone number
- `DELETE /api/phone-numbers/:id` - Delete phone number

### Recordings
- `GET /api/recordings` - List recordings
- `GET /api/recordings/:id` - Get recording

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/volume` - Call volume over time

### Webhooks
- `POST /api/webhooks/call-status` - Twilio call status webhook
- `POST /api/webhooks/recording-status` - Twilio recording webhook
- `POST /api/webhooks/gather-input` - Gather input webhook

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:

- **User** - User accounts with authentication
- **Organization** - Multi-tenant organizations
- **Workflow** - IVR workflows/diagrams
- **Call** - Call records and metadata
- **Recording** - Call recordings and transcriptions
- **PhoneNumber** - Twilio phone numbers
- **Analytics** - Analytics data

## Development

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm typecheck` - Type check TypeScript

## Production Deployment

1. Build the application:
```bash
pnpm build
```

2. Set production environment variables

3. Run database migrations:
```bash
pnpm db:migrate
```

4. Start the server:
```bash
pnpm start
```

## Security

- JWT authentication for all protected routes
- Password hashing with bcrypt
- CORS configuration
- Helmet.js for security headers
- Input validation with express-validator
- Rate limiting (can be added)

