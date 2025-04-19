// This file handles initialization for Vercel serverless functions
import { runMigrations } from '../drizzle/migrate.js';

// Flag to track if migrations have run
let migrationsRun = false;

// Middleware to ensure migrations have run
export default async function vercelMiddleware(req, res, next) {
  if (!migrationsRun) {
    try {
      // Run migrations if they haven't run yet
      await runMigrations();
      migrationsRun = true;
    } catch (error) {
      console.error('Failed to run migrations:', error);
    }
  }
  
  // Continue to the actual handler
  return next();
}