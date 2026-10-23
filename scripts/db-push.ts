import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

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
        image TEXT
      );
    `);

    // Pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        slug VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        hero_title VARCHAR(255) NOT NULL,
        hero_subtitle TEXT,
        hero_image TEXT,
        lead_text TEXT,
        announcement TEXT,
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
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        image TEXT,
        features TEXT[]
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
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100),
        comment TEXT,
        rating INTEGER DEFAULT 5,
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

    console.log("PostgreSQL database schema & tables created successfully!");
  } catch (err) {
    console.warn("Notice during db:push execution:", err);
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore disconnect errors
    }
  }
}

pushDb();
