// This script runs during Vercel build to set up environment and database
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

// Use environment variables provided by Vercel
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

process.env.NODE_ENV = 'production';

try {
  // Create .env file for build time (Vercel will use its own env vars in production)
  const envContent = `DATABASE_URL=${process.env.DATABASE_URL}\nNODE_ENV=production\n`;
  fs.writeFileSync('.env', envContent);
  
  console.log('Environment variables set for build');
  
  // Run the database migrations script
  console.log('Running database migrations...');
  try {
    execSync('node --experimental-modules test-db.js', { stdio: 'inherit' });
  } catch (migrationError) {
    console.error('Migration warning (non-fatal):', migrationError);
    console.log('Continuing with build despite migration warning...');
  }
  
  // Create a public directory if it doesn't exist (for static files)
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  
  // Create a simple index.html for Vercel to recognize this as a frontend app
  if (!fs.existsSync('public/index.html')) {
    fs.writeFileSync('public/index.html', `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>TGBHS Science Carnival</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
      </html>
    `);
  }
  
  // Run the build process
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Vercel build process completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}