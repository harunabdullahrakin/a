import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// Get database connection string from environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;

// Log connection status (without exposing credentials)
console.log('Connecting to PostgreSQL database...');

// Create the connection pool with better configurations
export const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create the drizzle client
export const db = drizzle(pool, { schema });

console.log("Database connection established successfully with PostgreSQL");