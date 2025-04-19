// Setup passport for authentication
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { storage } from '../server/storage';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// Hash password with salt
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha512');
  hash.update(password);
  hash.update(salt);
  return `${hash.digest('hex')}.${salt}`;
}

// Verify password with stored hash and salt
async function comparePasswords(supplied, stored) {
  const [hashedPassword, salt] = stored.split('.');
  const hash = createHash('sha512');
  hash.update(supplied);
  hash.update(salt);
  const suppliedHash = hash.digest('hex');
  
  // Use timingSafeEqual to prevent timing attacks
  const hashBuffer = Buffer.from(suppliedHash, 'hex');
  const storedHashBuffer = Buffer.from(hashedPassword, 'hex');
  
  return timingSafeEqual(hashBuffer, storedHashBuffer);
}

// Configure Passport
export function setupPassport() {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Local strategy for username/password login
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      const isValid = await comparePasswords(password, user.password);
      
      if (!isValid) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  return passport;
}