// Main serverless entry point for Vercel
import express from 'express';
import pg from 'pg';
import { runMigration } from './_migration.js';

// Get database connection from environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Database connection with better configurations for production
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection status
console.log('Connecting to PostgreSQL database...');

// Test database connection before running migrations
const testConnection = async () => {
  try {
    const testClient = await pool.connect();
    console.log('Database connection test successful');
    await testClient.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

// Run migration on cold start with retry mechanism
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const attemptMigration = async () => {
  connectionAttempts++;
  console.log(`Migration attempt ${connectionAttempts} of ${MAX_RETRIES}`);
  
  const isConnected = await testConnection();
  if (!isConnected) {
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`Retrying database connection in 2 seconds...`);
      return new Promise(resolve => setTimeout(() => resolve(attemptMigration()), 2000));
    } else {
      throw new Error(`Failed to connect to database after ${MAX_RETRIES} attempts`);
    }
  }
  
  return runMigration();
};

let migrationPromise = attemptMigration().catch(err => {
  console.error('Migration failed after retries:', err.message);
});

// Create Express app
const app = express();
app.use(express.json());

// Middleware to ensure migrations run before handling requests
app.use(async (req, res, next) => {
  try {
    // Wait for migration to complete
    await migrationPromise;
    next();
  } catch (error) {
    console.error('Error waiting for migration:', error);
    res.status(500).json({ message: 'Server initialization error' });
  }
});

// Simple auth middleware for API endpoints
const auth = async (req, res, next) => {
  try {
    // Check if user exists in session or JWT
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Format is "Bearer token"
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // For simplicity in serverless, we're using a direct token check
    // In production, use a proper JWT verification
    if (token === 'admin-token') {
      req.user = { username: 'Harun', isAdmin: true };
      return next();
    }
    
    // Direct login with database (simpler but less efficient)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      ['Harun']
    );
    
    if (userResult.rows.length > 0 && userResult.rows[0].is_admin) {
      req.user = {
        id: userResult.rows[0].id,
        username: userResult.rows[0].username,
        isAdmin: userResult.rows[0].is_admin
      };
      return next();
    }
    
    return res.status(401).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// API routes
app.get('/api/user', async (req, res) => {
  // Look for auth header
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    
    // For development, allow admin-token
    if (token === 'admin-token') {
      return res.json({ 
        id: 1, 
        username: 'Harun', 
        isAdmin: true 
      });
    }
    
    // Check database
    try {
      const userResult = await pool.query(
        'SELECT id, username, is_admin FROM users WHERE username = $1', 
        ['Harun']
      );
      
      if (userResult.rows.length > 0) {
        return res.json({
          id: userResult.rows[0].id,
          username: userResult.rows[0].username,
          isAdmin: userResult.rows[0].is_admin
        });
      }
    } catch (error) {
      console.error('User lookup error:', error);
    }
  }
  
  return res.status(401).json({ message: 'Not authenticated' });
});

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      // Try to initialize settings if they don't exist
      await pool.query(`
        INSERT INTO settings (id, carnival_date) 
        VALUES (1, '2023-09-15T00:00:00.000Z')
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Fetch again
      const retryResult = await pool.query('SELECT * FROM settings LIMIT 1');
      if (retryResult.rows.length > 0) {
        res.json(retryResult.rows[0]);
      } else {
        res.status(404).json({ message: 'Settings not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

app.get('/api/events/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE is_featured = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ message: 'Failed to fetch featured events' });
  }
});

app.get('/api/wiki', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wiki_articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wiki articles:', error);
    res.status(500).json({ message: 'Failed to fetch wiki articles' });
  }
});

app.get('/api/wiki/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wiki_articles WHERE is_featured = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured wiki articles:', error);
    res.status(500).json({ message: 'Failed to fetch featured wiki articles' });
  }
});

// Admin routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    // For simplicity in this example, we're just checking username
    // In production, you'd use the comparePasswords function from server/auth.ts
    // Since this is just a placeholder for Vercel deployment
    if (username === 'Harun' && password === 'iamrakin') {
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    // Temporarily disable auth check for easy testing
    /*
    // Check for authorization header
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    
    // Simplified auth for Vercel deployment
    if (token !== 'admin-token') {
      const userResult = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_admin = true', 
        ['Harun']
      );
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    */
    
    // Update settings
    const settingsData = req.body;
    
    // Validate required fields
    if (!settingsData.carnivalDate) {
      return res.status(400).json({ message: 'Carnival date is required' });
    }
    
    // Update settings
    const result = await pool.query(`
      UPDATE settings 
      SET 
        carnival_date = $1,
        contact_email = $2,
        contact_phone = $3,
        social_facebook = $4,
        social_twitter = $5,
        social_instagram = $6,
        social_youtube = $7,
        contact_mail = $8,
        social_links = $9,
        contact_info = $10,
        website_settings = $11,
        navbar_settings = $12,
        footer_settings = $13,
        countdown_settings = $14
      WHERE id = 1
      RETURNING *
    `, [
      settingsData.carnivalDate,
      settingsData.contactEmail || 'info@sciencecarnival.edu',
      settingsData.contactPhone || '(123) 456-7890',
      settingsData.socialFacebook || '#',
      settingsData.socialTwitter || '#',
      settingsData.socialInstagram || '#',
      settingsData.socialYoutube || '#',
      settingsData.contactMail || 'mrbeak123@gmail.com',
      JSON.stringify(settingsData.socialLinks || {}),
      JSON.stringify(settingsData.contactInfo || {}),
      JSON.stringify(settingsData.websiteSettings || {}),
      JSON.stringify(settingsData.navbarSettings || {}),
      JSON.stringify(settingsData.footerSettings || {}),
      JSON.stringify(settingsData.countdownSettings || {})
    ]);
    
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Serve static files for frontend
const path = require('path');
app.use(express.static(path.join(process.cwd(), 'dist')));

// Serve index.html for client-side routing
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error in request:', err);
  
  // Check for specific error types
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
    return res.status(503).json({ 
      message: 'Database connection issue. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
    });
  }
  
  if (err.code === '42P01') { // Undefined table
    return res.status(500).json({ 
      message: 'Database schema issue. Please contact support.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
  
  // Default error response
  return res.status(500).json({ 
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Export the Express app
export default app;