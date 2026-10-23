# Product Requirement Document (PRD): RedMoon Gaming Store

## 1. Overview
RedMoon Gaming Store is a specialized digital marketplace for high-level gaming accounts, in-game currency top-ups, and professional middleman (escrow) services. The platform is designed to provide secure, transparent, and fast transactions for competitive players in strategy games.

## 2. Key Features
- **Account Marketplace**: Browse and filter verified high-level strategy game accounts (Whiteout Survival, Kingshot, Rise of Kingdoms, Call of Dragons).
- **Instant Top-Up**: Integrated ordering system for in-game currency/packs.
- **Middleman Service**: Secure trading platform where RedMoon acts as a trusted intermediary to prevent fraud.
- **Admin CMS**: A comprehensive administrative panel to manage inventory, settings, and storefront content in real-time.
- **Social Proof**: Dynamic testimonial management and buyer rating display.
- **Direct Support**: Integrated communication channels (Discord and WhatsApp) for real-time transaction coordination.

## 3. Menus & Navigation
### Public Storefront
- **Home**: Hero section with trust indicators, game showcases, featured accounts, testimonials, and FAQ.
- **Accounts**: Filterable listing page for accounts with search, sorting (price), and status (Available/Sold).
- **Games/Top-Up**: Center for game-specific top-up options.
- **Services**: Description and details of middleman/escrow services.
- **Contact**: Support channels and help topics.

### Admin Panel
- **Overview**: System status and metrics.
- **Accounts (Jual Beli)**: CRUD operations for game accounts.
- **Top-Up Cards**: CRUD operations for top-up packages.
- **Middleware & Services**: CRUD operations for professional services.
- **Testimonials**: Manage user reviews.
- **Store Settings**: Configure Discord channels and support team contacts.

## 4. Technical Stack
- **Framework**: React (SPA) using Vite with TanStack Start.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **Database**: PostgreSQL (via Node.js `pg` driver).
- **Backend**: Server-side logic handled via TanStack Start `createServerFn` (RPC pattern).
- **Persistence**: Server-side PostgreSQL for production data; in-memory caching for performance.
- **Deployment**: Production build (`npm run build`) optimized for VPS/Cloud environment.
