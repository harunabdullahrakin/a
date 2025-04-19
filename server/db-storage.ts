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
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import PostgresqlStore from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PgStore = PostgresqlStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // For session store in production, use PostgreSQL
    this.sessionStore = new PgStore({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    });
    
    console.log("DatabaseStorage initialized with Neon PostgreSQL");
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // First try exact match
    const result = await db.select().from(users).where(eq(users.username, username));
    
    if (result.length > 0) {
      return result[0];
    }
    
    // If no match, try a case-insensitive search by getting all users and filtering
    const allUsers = await db.select().from(users);
    const lowerUsername = username.toLowerCase();
    
    const matchingUser = allUsers.find(
      user => user.username.toLowerCase() === lowerUsername
    );
    
    return matchingUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }
  
  async getFeaturedEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.isFeatured, true)).orderBy(desc(events.createdAt));
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values({
      ...insertEvent,
      createdAt: new Date()
    }).returning();
    return result[0];
  }
  
  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db
      .update(events)
      .set(eventUpdate)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Wiki article methods
  async getWikiArticles(): Promise<WikiArticle[]> {
    return await db.select().from(wikiArticles).orderBy(desc(wikiArticles.createdAt));
  }
  
  async getWikiArticle(id: number): Promise<WikiArticle | undefined> {
    const result = await db.select().from(wikiArticles).where(eq(wikiArticles.id, id));
    return result[0];
  }
  
  async getFeaturedWikiArticles(): Promise<WikiArticle[]> {
    return await db.select().from(wikiArticles).where(eq(wikiArticles.isFeatured, true)).orderBy(desc(wikiArticles.createdAt));
  }
  
  async createWikiArticle(insertArticle: InsertWikiArticle): Promise<WikiArticle> {
    const result = await db.insert(wikiArticles).values({
      ...insertArticle,
      createdAt: new Date()
    }).returning();
    return result[0];
  }
  
  async updateWikiArticle(id: number, articleUpdate: Partial<InsertWikiArticle>): Promise<WikiArticle | undefined> {
    const result = await db
      .update(wikiArticles)
      .set(articleUpdate)
      .where(eq(wikiArticles.id, id))
      .returning();
    return result[0];
  }
  
  async deleteWikiArticle(id: number): Promise<boolean> {
    const result = await db
      .delete(wikiArticles)
      .where(eq(wikiArticles.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    const result = await db.select().from(settings);
    return result[0];
  }
  
  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    // Check if settings exist
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      // Update existing settings
      const result = await db
        .update(settings)
        .set(settingsData)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return result[0];
    } else {
      // Create new settings with ID 1
      const result = await db
        .insert(settings)
        .values({
          ...settingsData,
          id: 1
        })
        .returning();
      return result[0];
    }
  }
}

import { IStorage } from "./storage";