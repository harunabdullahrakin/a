// Test script for database migrations
import { runMigrations } from './drizzle/migrate.js';

async function testDatabase() {
  try {
    console.log('Starting database migration test...');
    await runMigrations();
    console.log('Database migration test completed successfully!');
  } catch (error) {
    console.error('Database migration test failed:', error);
  }
}

testDatabase();