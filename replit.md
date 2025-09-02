# Overview

InvoiceBolt is a SaaS landing page prototype for validating demand for an invoicing tool that automates invoice creation from WhatsApp/Gmail conversations and enables instant UPI payments. This is a React-based single-page application built as a clickable mockup to capture early user interest and payments through a lifetime deal offering.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Server**: Express.js with TypeScript running in development and production modes
- **Build System**: Vite for frontend bundling and esbuild for server compilation
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **API Design**: RESTful API structure with /api prefix routing

## Development Workflow
- **Hot Reload**: Vite dev server with HMR for rapid development iterations
- **TypeScript**: Strict type checking across client, server, and shared code
- **Path Aliases**: Configured aliases (@/, @shared/) for clean import statements
- **Error Handling**: Runtime error overlay for development debugging

## Data Storage
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **User Model**: Basic user schema with username/password authentication ready for expansion

## External Dependencies
- **Database Provider**: Neon Database (PostgreSQL-compatible serverless database)
- **Payment Processing**: Razorpay integration for lifetime deal payments
- **QR Code Generation**: QR Server API for UPI payment QR codes
- **Deployment**: Configured for Replit hosting with development banner integration
- **UI Components**: Radix UI ecosystem for accessible component primitives
- **Styling**: Tailwind CSS with PostCSS processing pipeline
- **Font Loading**: Google Fonts integration with multiple font families (Architects Daughter, DM Sans, Fira Code, Geist Mono)