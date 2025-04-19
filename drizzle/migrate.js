// This file handles database migrations for Vercel deployment
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// Get database connection from environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Database connection string
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

// Log connection status
console.log('Connecting to PostgreSQL database for migrations...');

export const runMigrations = async () => {
  console.log('Running database migrations...');
  
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);
  
  try {
    // Create extension if it doesn't exist
    await db.execute(`CREATE EXTENSION IF NOT EXISTS citext;`);
    
    // This will automatically create tables based on your schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        image TEXT NOT NULL,
        presenter TEXT NOT NULL,
        presenter_image TEXT,
        is_featured BOOLEAN DEFAULT false NOT NULL,
        registration_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS wiki_articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        carnival_date TEXT NOT NULL,
        contact_email TEXT DEFAULT 'info@sciencecarnival.edu' NOT NULL,
        contact_phone TEXT DEFAULT '(123) 456-7890' NOT NULL,
        social_facebook TEXT DEFAULT '#' NOT NULL,
        social_twitter TEXT DEFAULT '#' NOT NULL,
        social_instagram TEXT DEFAULT '#' NOT NULL,
        social_youtube TEXT DEFAULT '#' NOT NULL,
        contact_mail TEXT DEFAULT 'mrbeak123@gmail.com' NOT NULL,
        social_links JSONB NOT NULL DEFAULT '{"facebook": "#", "twitter": "#", "instagram": "#", "youtube": "#"}',
        contact_info JSONB NOT NULL DEFAULT '{"email": "info@sciencecarnival.edu", "phone": "(123) 456-7890"}',
        website_settings JSONB NOT NULL DEFAULT '{"title": "TGBHS SCIENCE FIESTA", "description": "Explore the wonders of science at our annual TGBHS SCIENCE FIESTA", "favicon": "", "headerCode": "", "footerCode": ""}',
        navbar_settings JSONB NOT NULL DEFAULT '{"logo": "", "logoText": "SF", "siteTitle": "SCIENCE FIESTA", "primaryColor": "#3b82f6", "registrationLink": "https://example.com/register", "displayMode": "logo-text"}',
        footer_settings JSONB NOT NULL DEFAULT '{"logoText": "Science Carnival", "tagline": "Explore, Discover, Innovate", "description": "Join us for an unforgettable celebration of science, technology, and innovation.", "privacyPolicyLink": "#", "termsLink": "#", "copyrightText": "© Science Carnival. All rights reserved."}',
        countdown_settings JSONB NOT NULL DEFAULT '{"enabled": true, "title": "The Science Carnival is coming!", "subtitle": "Join us for a day of discovery and innovation", "buttonText": "Register Now", "buttonLink": "https://example.com/register", "backgroundColor": "#0f172a", "textColor": "#ffffff"}'
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY (sid)
      );
    `);
    
    // Insert default admin user if not exists
    await db.execute(`
      INSERT INTO users (username, password, is_admin)
      VALUES ('admin', 'ef463267ba5d15cd06568ce3c0261025c05e1edc7aa7fdaeda83760586d696ddf15e2e4db1e1af0283a7bb4d6c82780a4116aca0255a7d1de029127435c9f681.0123456789abcdef', true),
             ('harun', 'a82e1e15cc1faa2e0ca07d56433606f86c7ee9f9a0e4ff9bafe07537bcada5e8cdc04d59636971130d3b8d419612abeb491c8ec224cc29ef7fc5ed2888907c19.0123456789abcdef', true)
      ON CONFLICT (username) DO NOTHING;
    `);
    
    // Insert default settings if not exists
    await db.execute(`
      INSERT INTO settings (id, carnival_date)
      VALUES (1, '2023-10-15')
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};