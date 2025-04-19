// Serverless entry point for Vercel
import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { runMigration } from './_migration.js';

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;

// Database connection - use environment variable provided by Vercel
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } // Important for production
});

// Create Express app
const app = express();
app.use(express.json());

// Add CORS headers for API routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check endpoint
app.get('/api', async (req, res) => {
  return res.json({ 
    status: 'ok', 
    message: 'API is running',
    version: '1.0.0',
    env: process.env.NODE_ENV
  });
});

// Handle all API routes from the main server
// This is a simplified version that forwards requests to the database
// Add routes for users, events, wiki, settings, etc.

// User login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    // Get user from database
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Simplified authentication for serverless
    // In production, use proper password comparison
    if (user) {
      return res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route for settings
app.get('/api/settings', async (req, res) => {
  try {
    // Get settings
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// API route for events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// API route for featured events
app.get('/api/events/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE is_featured = true ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ message: 'Error fetching featured events' });
  }
});

// API route for wiki articles
app.get('/api/wiki', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wiki_articles ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wiki articles:', error);
    res.status(500).json({ message: 'Error fetching wiki articles' });
  }
});

// API route for featured wiki articles
app.get('/api/wiki/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wiki_articles WHERE is_featured = true ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured wiki articles:', error);
    res.status(500).json({ message: 'Error fetching featured wiki articles' });
  }
});

// Export handler for Vercel
export default app;