import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for PostgreSQL schema setup.");
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:EDUJUANDA12345@localhost:5432/BLUEMASK";

async function pushDb() {
  console.log("Connecting to PostgreSQL database...");
  const client = new pg.Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL.");

    console.log("Creating PostgreSQL tables if not exist...");

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        code VARCHAR(255) PRIMARY KEY,
        game VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        badge VARCHAR(100),
        price NUMERIC(12, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'tersedia',
        discount_percent INTEGER,
        has_discount BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        screenshots TEXT[],
        description TEXT,
        server VARCHAR(100),
        stats JSONB,
        highlights TEXT[]
      );
    `);

    // Topups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS topups (
        code VARCHAR(255) PRIMARY KEY,
        game VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        detail TEXT,
        price NUMERIC(12, 2) NOT NULL,
        image TEXT,
        category VARCHAR(100),
        popular BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        features TEXT[],
        instructions TEXT,
        delivery_time VARCHAR(255),
        has_discount BOOLEAN NOT NULL DEFAULT FALSE,
        discount_percent INTEGER,
        diamonds INTEGER
      );
    `);

    // Pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        slug VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        hero_title VARCHAR(255),
        hero_subtitle TEXT,
        hero_image TEXT,
        hero_image_mobile TEXT,
        lead_text TEXT,
        announcement TEXT,
        button_text VARCHAR(255),
        button_link TEXT,
        secondary_button_text VARCHAR(255),
        secondary_button_link TEXT,
        section_title VARCHAR(255),
        section_subtitle TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Media table
    await client.query(`
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data_url TEXT NOT NULL,
        size INTEGER,
        type VARCHAR(100),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        slug VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        tagline TEXT,
        intro TEXT,
        steps JSONB NOT NULL DEFAULT '[]'::jsonb,
        image TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        game_slugs TEXT[],
        checklist TEXT[],
        fee VARCHAR(255),
        title VARCHAR(255),
        description TEXT
      );
    `);

    // Game Worlds section table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_worlds (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        image TEXT,
        image_alt TEXT,
        number_code VARCHAR(50),
        services TEXT[],
        account_points TEXT[],
        sort_order INTEGER DEFAULT 0
      );
    `);

    // Home Games section table
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_games (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        image TEXT,
        image_alt TEXT,
        action_text VARCHAR(100),
        link_url TEXT,
        sort_order INTEGER DEFAULT 0
      );
    `);

    // Testimonials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(255) PRIMARY KEY,
        service VARCHAR(255),
        game VARCHAR(255),
        name VARCHAR(255),
        role VARCHAR(100),
        quote TEXT,
        date VARCHAR(255),
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        comment TEXT,
        avatar TEXT
      );
    `);

    // FAQs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR(255) PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      );
    `);

    // Store settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);

    // Add current application columns to databases created with older schemas.
    await client.query(`
      ALTER TABLE topups
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS popular BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS features TEXT[],
        ADD COLUMN IF NOT EXISTS instructions TEXT,
        ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(255),
        ADD COLUMN IF NOT EXISTS has_discount BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS discount_percent INTEGER,
        ADD COLUMN IF NOT EXISTS diamonds INTEGER;
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS discount_percent INTEGER,
        ADD COLUMN IF NOT EXISTS has_discount BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE pages
        ALTER COLUMN hero_title DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS hero_image_mobile TEXT,
        ADD COLUMN IF NOT EXISTS button_text VARCHAR(255),
        ADD COLUMN IF NOT EXISTS button_link TEXT,
        ADD COLUMN IF NOT EXISTS secondary_button_text VARCHAR(255),
        ADD COLUMN IF NOT EXISTS secondary_button_link TEXT,
        ADD COLUMN IF NOT EXISTS section_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS section_subtitle TEXT;
      ALTER TABLE services
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tagline TEXT,
        ADD COLUMN IF NOT EXISTS intro TEXT,
        ADD COLUMN IF NOT EXISTS steps JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS game_slugs TEXT[],
        ADD COLUMN IF NOT EXISTS checklist TEXT[],
        ADD COLUMN IF NOT EXISTS fee VARCHAR(255),
        ADD COLUMN IF NOT EXISTS title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE services ALTER COLUMN title DROP NOT NULL;
      UPDATE services SET name = title WHERE name IS NULL AND title IS NOT NULL;
      UPDATE services SET intro = description WHERE intro IS NULL AND description IS NOT NULL;
      ALTER TABLE testimonials
        ADD COLUMN IF NOT EXISTS service VARCHAR(255),
        ADD COLUMN IF NOT EXISTS game VARCHAR(255),
        ADD COLUMN IF NOT EXISTS quote TEXT,
        ADD COLUMN IF NOT EXISTS date VARCHAR(255),
        ADD COLUMN IF NOT EXISTS image TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS comment TEXT,
        ADD COLUMN IF NOT EXISTS avatar TEXT;
      UPDATE testimonials SET quote = comment WHERE quote IS NULL AND comment IS NOT NULL;
      UPDATE testimonials SET image = avatar WHERE image IS NULL AND avatar IS NOT NULL;
    `);

    console.log("PostgreSQL database schema & tables created successfully!");
  } catch (err) {
    console.error("Failed to create or migrate PostgreSQL schema:", err);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore disconnect errors
    }
  }
}

pushDb();
