-- RedMoon Gaming Store Migration Script
-- Version: 2026-10-23.2
-- Target: PostgreSQL 10+

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    code VARCHAR(255) PRIMARY KEY,
    game VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    badge TEXT,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status TEXT,
    image TEXT,
    screenshots JSONB,
    description TEXT,
    server TEXT,
    stats JSONB,
    highlights JSONB
);

-- 2. Top-ups Table
CREATE TABLE IF NOT EXISTS topups (
    code VARCHAR(255) PRIMARY KEY,
    game VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    detail TEXT,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    image TEXT,
    category TEXT,
    popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
    slug VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    intro TEXT,
    steps JSONB,
    image TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 4. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(255) PRIMARY KEY,
    service VARCHAR(255) NOT NULL,
    game VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    quote TEXT NOT NULL,
    date VARCHAR(255),
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(255) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

-- 6. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB
);

-- 7. Pages Table
CREATE TABLE IF NOT EXISTS pages (
    slug VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image TEXT,
    lead_text TEXT,
    announcement TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Game Worlds Table
CREATE TABLE IF NOT EXISTS game_worlds (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    genre TEXT,
    image TEXT,
    image_alt TEXT,
    number_code VARCHAR(50),
    services JSONB,
    account_points JSONB,
    sort_order INTEGER DEFAULT 0
);

-- 9. Home Games Table
CREATE TABLE IF NOT EXISTS home_games (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    image VARCHAR(255),
    image_alt TEXT,
    action_text TEXT,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 10. Media Table
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- D Deltas (ALTER TABLE ... ADD COLUMN IF NOT EXISTS)
ALTER TABLE topups ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE topups ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT FALSE;
ALTER TABLE topups ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE services ADD COLUMN IF NOT EXISTS steps JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_game ON products(game);
CREATE INDEX IF NOT EXISTS idx_topups_game ON topups(game);
CREATE INDEX IF NOT EXISTS idx_topups_sort ON topups(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_sort ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_game_worlds_sort ON game_worlds(sort_order);
CREATE INDEX IF NOT EXISTS idx_home_games_sort ON home_games(sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at);
