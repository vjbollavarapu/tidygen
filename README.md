# iNEAT ERP Frontend

A modern React + TypeScript frontend for the iNEAT ERP platform with Web3 integration.

## 🚀 Features

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent UI
- **React Router** for client-side routing
- **Zustand** for state management
- **React Query** for server state management
- **Web3 Integration** with ethers.js and MetaMask
- **Responsive Design** for all device sizes
- **Docker Support** for containerized deployment

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── auth/           # Authentication components
│   └── web3/           # Web3 integration components
├── layouts/            # Layout components
├── pages/              # Page components
├── store/              # Zustand state management
├── services/           # API services
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── lib/                # Library configurations
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Installation

1. **Clone and navigate to frontend directory:**
   ```bash
   cd apps/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Docker Development

```bash
# Build and run with Docker
npm run docker:dev

# Or manually
docker-compose -f docker-compose.dev.yml up
```

## 🎨 UI Components

The project uses a combination of:

- **Tailwind CSS** for styling
- **shadcn/ui** for pre-built components
- **Lucide React** for icons
- **Custom components** for specific functionality

### Available Components

- `Button` - Various button styles and sizes
- `Input` - Form input fields
- `Card` - Content containers
- `LoginForm` - User authentication
- `RegisterForm` - User registration
- `WalletConnect` - Web3 wallet integration
- `DashboardLayout` - Main application layout

## 🔐 Authentication

The frontend implements JWT-based authentication with:

- **Login/Register forms** with validation
- **Protected routes** that require authentication
- **Automatic token refresh** handling
- **Persistent login state** with Zustand
- **Logout functionality** with token cleanup

## ⛓️ Web3 Integration

Web3 features include:

- **MetaMask wallet connection**
- **Wallet address display** and management
- **Message signing** for verification
- **Network switching** support
- **Balance checking** functionality
- **Transaction history** (coming soon)

### Web3 Setup

1. **Install MetaMask** browser extension
2. **Connect wallet** using the Web3 page
3. **Sign messages** to verify ownership
4. **Switch networks** as needed

## 🗂️ State Management

### Zustand Stores

- **Auth Store** - User authentication state
- **Web3 Store** - Blockchain wallet state

### React Query

- **API data fetching** with caching
- **Automatic refetching** on window focus
- **Error handling** and retry logic
- **Loading states** management

## 🎯 Routing

The application uses React Router with:

- **Protected routes** for authenticated users
- **Public routes** for login/register
- **Nested routing** for dashboard sections
- **Automatic redirects** based on auth state

### Available Routes

- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/dashboard/web3` - Web3 integration
- `/dashboard/users` - User management (placeholder)
- `/dashboard/organizations` - Organization management (placeholder)
- `/dashboard/inventory` - Inventory management (placeholder)
- `/dashboard/sales` - Sales management (placeholder)
- `/dashboard/purchasing` - Purchasing management (placeholder)
- `/dashboard/finance` - Finance management (placeholder)
- `/dashboard/hr` - HR management (placeholder)
- `/dashboard/settings` - Settings (placeholder)

## 🐳 Docker Deployment

### Production Build

```bash
# Build production image
npm run docker:build

# Run production container
npm run docker:run
```

### Docker Compose

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production (with backend)
docker-compose -f ../infra/docker/development/docker-compose.yml up
```

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first** design approach
- **Breakpoint-based** layouts
- **Touch-friendly** interactions
- **Optimized** for all screen sizes

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_WEB3_NETWORK_ID` - Default Web3 network
- `VITE_WEB3_RPC_URL` - Web3 RPC endpoint
- `VITE_ENABLE_WEB3` - Enable/disable Web3 features
- `VITE_DEBUG` - Debug mode

### Tailwind Configuration

Custom theme with:
- **CSS variables** for colors
- **Dark mode** support
- **Custom spacing** and typography
- **Component variants** for consistency

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 🚀 Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Serve static files:**
   ```bash
   npm run serve
   ```

3. **Or use Docker:**
   ```bash
   npm run docker:build
   npm run docker:run
   ```

## 📚 API Integration

The frontend integrates with the Django REST API:

- **Authentication endpoints** for login/register
- **User management** for profile updates
- **Web3 endpoints** for wallet operations
- **Error handling** with user-friendly messages
- **Loading states** for better UX

## 🔄 Development Workflow

1. **Make changes** to components or pages
2. **Test locally** with `npm run dev`
3. **Type check** with `npm run type-check`
4. **Lint code** with `npm run lint`
5. **Build** to verify production build
6. **Deploy** using Docker or static hosting

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Follow the component naming conventions
4. Add proper error handling
5. Test on multiple screen sizes
6. Update documentation as needed

## 📄 License

This project is part of the iNEAT ERP platform and follows the same licensing terms.