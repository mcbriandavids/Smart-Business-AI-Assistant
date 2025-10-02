# Smart Business AI Agent - Copilot Instructions

## 🏗️ Architecture Overview

This is a **multi-tenant business AI platform** with a monorepo structure containing:

- **Backend**: NestJS API (`packages/backend/`) with modular architecture
- **Admin Dashboard**: Next.js super-admin interface (`packages/admin-dashboard/`) on port 3002
- **User Dashboard**: Next.js business user interface (`packages/user-dashboard/`) on port 3003
- **Frontend**: Next.js main application (`packages/frontend/`) on port 3000

### Core Business Modules

Located in `packages/backend/src/modules/`:

- `customers/` - Customer management and segmentation
- `products/` - Product catalog and inventory
- `notifications/` - Multi-channel messaging (SMS/WhatsApp/Email via Twilio)
- `ai/` - OpenAI integration for chat and recommendations
- `analytics/` - Business intelligence and reporting
- `delivery/` - Logistics and coordination
- `auth/` - JWT-based authentication
- `websocket/` - Real-time updates via Socket.IO

## 🚀 Development Workflow

### Quick Start Commands

```bash
# Install all dependencies (required first time)
npm run install:all

# Start all services in development
npm run dev  # Runs backend + admin + user dashboards

# Individual services
npm run dev:backend   # NestJS API on :3001
npm run dev:admin     # Admin dashboard on :3002
npm run dev:user      # User dashboard on :3003
npm run dev:frontend  # Main frontend on :3000
```

### Testing & Building

- `npm run test` - Run all test suites across packages
- `npm run build` - Build all packages for production
- Backend uses Jest with `jest.config.json` in each package

## 🔧 Key Configuration Patterns

### Environment Setup

Backend requires `.env` in `packages/backend/`:

```env
# Required API integrations
OPENAI_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Authentication
JWT_SECRET=your_jwt_secret
```

### Module Architecture Pattern

Each backend module follows NestJS conventions:

- `*.module.ts` - Module definition with imports/providers
- `*.entity.ts` - TypeORM entity definitions (when using DB)
- `*.service.ts` - Business logic and external API integrations
- `*.controller.ts` - REST API endpoints with Swagger docs

### Frontend Tech Stack

- **UI Framework**: Material-UI (MUI) v5 with emotion styling
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Yup validation
- **Routing**: Next.js App Router (v14+)
- **Authentication**: JWT tokens stored in cookies

## 🔌 Integration Points

### Multi-channel Notifications

The `notifications/` module orchestrates:

- **Twilio** for SMS/WhatsApp messaging
- **Nodemailer** for email campaigns
- **Template system** for personalized messages
- **Scheduling** via `@nestjs/schedule` for automated campaigns

### AI Integration

- **OpenAI API** in `ai/` module for chat responses and recommendations
- **WebSocket** real-time updates for chat interfaces
- **Context-aware** prompts based on customer history and inventory

### Real-time Features

- **Socket.IO** WebSocket gateway in `websocket/` module
- **Event-driven** notifications for inventory changes, order updates
- **Multi-room** support for tenant isolation

## 📝 Development Guidelines

### Adding New Features

1. **Backend**: Create module in `src/modules/` following NestJS patterns
2. **Frontend**: Add pages in `src/app/` using App Router structure
3. **Cross-package**: Update root `package.json` scripts if needed
4. **Documentation**: Update README.md with new capabilities

### API Development

- Use **Swagger decorators** for automatic API documentation
- Follow **RESTful** conventions with proper HTTP status codes
- Implement **JWT guards** for protected endpoints
- Add **validation pipes** using class-validator

### Testing Strategy

- **Unit tests** for services and controllers
- **Integration tests** for API endpoints
- **Component tests** for React components using Jest + Testing Library
- **E2E tests** for critical user workflows

## 🎯 Business Context

This platform serves **small-medium retail businesses** with:

- **Customer engagement** automation via AI-powered notifications
- **Inventory management** with smart alerts and reordering
- **Multi-tenant** architecture supporting multiple business accounts
- **Analytics** for business intelligence and growth insights
- **Omnichannel** communication (SMS, WhatsApp, Email, Web chat)

When implementing features, consider the **SMB user experience** - prioritize simplicity and automation over complex configuration.
