# IVR Builder - Production Setup Guide

This is a complete, production-ready IVR (Interactive Voice Response) builder system with full telephony integration.

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │ (React + ReactFlow)
│  (Port 4200)│
└──────┬──────┘
       │
       │ HTTP/REST API
       │
┌──────▼──────┐
│   Backend   │ (Node.js + Express)
│  (Port 3000)│
└──────┬──────┘
       │
       ├──► PostgreSQL Database
       │
       └──► Twilio API (Telephony)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22.12.0
- pnpm 10.9.0
- PostgreSQL 16+
- Twilio Account (for telephony features)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb ivr_builder

# Or use Docker
docker-compose up -d postgres
```

### 3. Configure Environment

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ivr_builder"
JWT_SECRET="your-super-secret-jwt-key"
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
WEBHOOK_BASE_URL="https://your-domain.com"
```

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Initialize Database

```bash
# Generate Prisma client
pnpm --filter backend db:generate

# Run migrations
pnpm --filter backend db:migrate

# Seed database (optional)
pnpm --filter backend db:seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
pnpm dev

# Or start separately:
pnpm dev:frontend  # Frontend only
pnpm dev:backend   # Backend only
```

## 📦 Production Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. **Build applications:**
```bash
pnpm build
```

2. **Set production environment variables**

3. **Run database migrations:**
```bash
pnpm --filter backend db:migrate
```

4. **Start backend:**
```bash
cd apps/backend
pnpm start
```

5. **Serve frontend:**
```bash
# Build frontend and serve with nginx/apache
# Or use a static hosting service (Vercel, Netlify, etc.)
```

## 🔑 Features

### ✅ Core Features
- Visual IVR flow builder (drag-and-drop)
- 15+ IVR node types
- Real-time simulation with TTS
- Workflow versioning
- Multi-tenant support

### ✅ Telephony Integration
- Twilio Studio Flow deployment
- Inbound/outbound call handling
- Call recording and transcription
- DTMF and speech input
- Call forwarding and transfer

### ✅ Backend API
- RESTful API with Express.js
- JWT authentication
- PostgreSQL database
- Webhook handling
- Analytics and reporting

### ✅ Production Ready
- Error handling and logging
- Input validation
- Security headers (Helmet)
- CORS configuration
- Database migrations
- Docker support

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `POST /api/workflows/:id/deploy` - Deploy to Twilio
- `DELETE /api/workflows/:id` - Delete workflow

### Calls
- `GET /api/calls` - List calls
- `POST /api/calls` - Make outbound call
- `GET /api/calls/:id` - Get call details

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/volume` - Call volume data

## 🔐 Security

- JWT token authentication
- Password hashing with bcrypt
- SQL injection protection (Prisma)
- XSS protection (Helmet)
- CORS configuration
- Input validation

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `organizations` - Multi-tenant orgs
- `workflows` - IVR workflows
- `calls` - Call records
- `recordings` - Call recordings
- `phone_numbers` - Twilio numbers
- `analytics` - Analytics data

## 🧪 Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## 📝 Environment Variables

See `apps/backend/.env.example` for all required variables.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Twilio Integration Issues
- Verify Twilio credentials
- Check webhook URLs are publicly accessible
- Ensure phone numbers are verified in Twilio

### Frontend API Errors
- Check VITE_API_URL is correct
- Verify backend is running
- Check browser console for CORS errors

## 📚 Documentation

- [Backend API Docs](./apps/backend/README.md)
- [Frontend Docs](./apps/frontend/README.md)
- [Database Schema](./apps/backend/prisma/schema.prisma)

## 🎯 Next Steps

1. Set up Twilio account and configure credentials
2. Purchase phone numbers via Twilio or API
3. Deploy workflows to production
4. Configure webhook URLs in Twilio
5. Set up monitoring and logging
6. Configure S3 for recording storage (optional)

## 💡 Demo Credentials

After seeding:
- Email: `demo@ivrbuilder.com`
- Password: `demo123456`

---

**Built with ❤️ for production IVR systems**

