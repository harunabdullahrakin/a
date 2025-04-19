import {
  users,
  events,
  wikiArticles,
  settings,
  type User,
  type InsertUser,
  type Event,
  type InsertEvent,
  type WikiArticle,
  type InsertWikiArticle,
  type Settings,
  type InsertSettings
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from 'postgres';
import session from "express-session";
import pgSessionStore from "connect-pg-simple";
import { neonConfig, neon } from '@neondatabase/serverless';

// Configure neon for serverless environments
neonConfig.fetchConnectionCache = true;

// Interface for storage operations (same as in MemStorage)
import { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  sessionStore: any;

  constructor() {
    // Use the same connection string for both client and sessionStore
    const connectionString = process.env.DATABASE_URL || '';
    
    // Create neon client for Vercel serverless environment
    const sql = neon(connectionString);
    
    // Initialize Drizzle with the neon client
    this.db = drizzle(sql);
    
    // Setup session store with connect-pg-simple
    const PgStore = pgSessionStore(session);
    this.sessionStore = new PgStore({
      conString: connectionString,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return await this.db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await this.db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return await this.db.select().from(events).where(eq(events.isFeatured, true));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await this.db.insert(events).values(insertEvent).returning();
    return result[0];
  }

  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await this.db
      .update(events)
      .set(eventUpdate)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await this.db.delete(events).where(eq(events.id, id));
    return !!result;
  }

  // Wiki article methods
  async getWikiArticles(): Promise<WikiArticle[]> {
    return await this.db.select().from(wikiArticles);
  }

  async getWikiArticle(id: number): Promise<WikiArticle | undefined> {
    const result = await this.db.select().from(wikiArticles).where(eq(wikiArticles.id, id));
    return result[0];
  }

  async getFeaturedWikiArticles(): Promise<WikiArticle[]> {
    return await this.db.select().from(wikiArticles).where(eq(wikiArticles.isFeatured, true));
  }

  async createWikiArticle(insertArticle: InsertWikiArticle): Promise<WikiArticle> {
    const result = await this.db.insert(wikiArticles).values(insertArticle).returning();
    return result[0];
  }

  async updateWikiArticle(id: number, articleUpdate: Partial<InsertWikiArticle>): Promise<WikiArticle | undefined> {
    const result = await this.db
      .update(wikiArticles)
      .set(articleUpdate)
      .where(eq(wikiArticles.id, id))
      .returning();
    return result[0];
  }

  async deleteWikiArticle(id: number): Promise<boolean> {
    const result = await this.db.delete(wikiArticles).where(eq(wikiArticles.id, id));
    return !!result;
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    const result = await this.db.select().from(settings);
    return result[0];
  }

  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    // Check if settings exist
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      // Update existing settings
      const result = await this.db
        .update(settings)
        .set(settingsData)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return result[0];
    } else {
      // Create new settings
      const result = await this.db.insert(settings).values(settingsData).returning();
      return result[0];
    }
  }
}