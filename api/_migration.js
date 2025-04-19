// Database migration script to run during Vercel deployment
import pg from 'pg';

// Get database connection from environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Database connection
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

// Run migrations
export async function runMigration() {
  console.log('Running database migrations...');
  
  const pool = new Pool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Test connection first
    const client = await pool.connect();
    await client.query('SELECT 1'); // Simple query to verify connection
    console.log('Database connection verified successfully');
    client.release();
    // Create extension if it doesn't exist
    await pool.query(`CREATE EXTENSION IF NOT EXISTS citext;`);
    
    // Create tables if they don't exist
    await pool.query(`
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
    `);
    
    // Insert default admin user if not exists
    await pool.query(`
      INSERT INTO users (username, password, is_admin)
      VALUES ('admin', 'a5bb0c7f3f19c921c9a6b4e714c5b9ee5c2e8d0e429b3c6d5b65a8e19686522f.87df1238f9c908c7', true)
      ON CONFLICT (username) DO NOTHING;
    `);
    
    // Insert default settings if not exists
    await pool.query(`
      INSERT INTO settings (id, carnival_date)
      VALUES (1, '2023-09-15T00:00:00.000Z')
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}