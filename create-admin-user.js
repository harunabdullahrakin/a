// Script to create an admin user in the database
const { Pool } = require('pg');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

// Initialize the pool with the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  console.log('Creating admin user...');
  
  try {
    // Set up admin user details
    const username = 'admin';
    const password = await hashPassword('admin123');
    const isAdmin = true;
    
    // Check if user exists
    const checkResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    
    if (checkResult.rows.length > 0) {
      // Update existing user
      console.log(`User '${username}' already exists. Updating password...`);
      await pool.query(
        'UPDATE users SET password = $1, is_admin = $2 WHERE username = $3',
        [password, isAdmin, username]
      );
      console.log(`User '${username}' updated with new password.`);
    } else {
      // Create new admin user
      console.log(`Creating new admin user '${username}'...`);
      await pool.query(
        'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)',
        [username, password, isAdmin]
      );
      console.log(`Admin user '${username}' created successfully!`);
    }
    
    // Add a second admin user with username "harun"
    const harunUsername = 'harun';
    const harunPassword = await hashPassword('iamrakin');
    
    const checkHarunResult = await pool.query('SELECT id FROM users WHERE username = $1', [harunUsername]);
    
    if (checkHarunResult.rows.length > 0) {
      // Update existing user
      console.log(`User '${harunUsername}' already exists. Updating password...`);
      await pool.query(
        'UPDATE users SET password = $1, is_admin = $2 WHERE username = $3',
        [harunPassword, isAdmin, harunUsername]
      );
      console.log(`User '${harunUsername}' updated with new password.`);
    } else {
      // Create new admin user
      console.log(`Creating new admin user '${harunUsername}'...`);
      await pool.query(
        'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)',
        [harunUsername, harunPassword, isAdmin]
      );
      console.log(`Admin user '${harunUsername}' created successfully!`);
    }
  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    // Close the connection
    await pool.end();
  }
}

// Run the function
createAdminUser();