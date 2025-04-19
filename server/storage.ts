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
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User | undefined>;
  
  // Event management
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getFeaturedEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Wiki article management
  getWikiArticles(): Promise<WikiArticle[]>;
  getWikiArticle(id: number): Promise<WikiArticle | undefined>;
  getFeaturedWikiArticles(): Promise<WikiArticle[]>;
  createWikiArticle(article: InsertWikiArticle): Promise<WikiArticle>;
  updateWikiArticle(id: number, article: Partial<InsertWikiArticle>): Promise<WikiArticle | undefined>;
  deleteWikiArticle(id: number): Promise<boolean>;
  
  // Settings management
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  // Session store
  sessionStore: any; // Using any for session store type compatibility
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private wikiArticles: Map<number, WikiArticle>;
  private appSettings: Settings | undefined;
  sessionStore: any;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private wikiArticleIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.wikiArticles = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.wikiArticleIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default settings
    this.appSettings = {
      id: 1,
      carnivalDate: "2023-09-15T00:00:00.000Z",
      
      // Contact information for footer
      contactEmail: "info@sciencecarnival.edu",
      contactPhone: "(123) 456-7890",
      
      // Social links for footer
      socialFacebook: "https://facebook.com/sciencecarnival",
      socialTwitter: "https://twitter.com/sciencecarnival",
      socialInstagram: "https://instagram.com/sciencecarnival",
      socialYoutube: "https://youtube.com/sciencecarnival",
      
      // Legacy fields (for backward compatibility)
      socialLinks: {
        facebook: "https://facebook.com/sciencecarnival",
        twitter: "https://twitter.com/sciencecarnival",
        instagram: "https://instagram.com/sciencecarnival",
        youtube: "https://youtube.com/sciencecarnival"
      },
      contactInfo: {
        email: "info@sciencecarnival.edu",
        phone: "(123) 456-7890",
        address: "123 Science Street, Education City, ED 12345"
      },
      
      // Website settings
      websiteSettings: {
        title: "School Science Carnival - Explore, Discover, Create",
        description: "Explore the wonders of science at our annual School Science Carnival. Join us for exciting experiments, competitions, and discovery.",
        favicon: "",
        headerCode: "",
        footerCode: ""
      },
      
      // Navbar customization
      navbarSettings: {
        logo: "",
        logoText: "SC",
        primaryColor: "#3b82f6",
        registrationLink: "https://example.com/register",
        displayMode: "logo-text"
      },
      
      // Footer customization
      footerSettings: {
        logoText: "Science Carnival",
        tagline: "Explore, Discover, Innovate",
        description: "Join us for an unforgettable celebration of science, technology, and innovation.",
        privacyPolicyLink: "#",
        termsLink: "#",
        copyrightText: "© Science Carnival. All rights reserved."
      },
      
      // Countdown timer customization
      countdownSettings: {
        enabled: true,
        title: "The Science Carnival is coming!",
        subtitle: "Join us for a day of discovery and innovation",
        buttonText: "Register Now",
        buttonLink: "https://example.com/register",
        backgroundColor: "#0f172a",
        textColor: "#ffffff"
      }
    };
    
    // Add sample data
    this.initializeData();
  }

  private initializeData() {
    // Add default admin users
    this.createUser({
      username: "admin",
      password: "a5bb0c7f3f19c921c9a6b4e714c5b9ee5c2e8d0e429b3c6d5b65a8e19686522f.87df1238f9c908c7",
      isAdmin: true
    });
    
    // Create a new admin account with username harun
    this.createUser({
      username: "harun",
      // This is the hashed password for "iamrakin", generated and tested with our hash function
      password: "82f598d37be4862bcdd0212327fd51adc31857e1c69d9fa0883036b9af4ca4c4a3bba5d5ed9dbd378343f360faa6e37b0fd7f619a81c8a245a913340b47db775.a3a2c7bd0c394c7b6aa952c66435a81f",
      isAdmin: true
    });
    
    // Add sample events and wiki articles in a real implementation
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin === undefined ? false : insertUser.isAdmin
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      password: newPassword
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getFeaturedEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.isFeatured);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: new Date(),
      presenterImage: insertEvent.presenterImage ?? null,
      registrationLink: insertEvent.registrationLink ?? null,
      isFeatured: insertEvent.isFeatured ?? false
    };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = {
      ...existingEvent,
      ...eventUpdate
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Wiki article methods
  async getWikiArticles(): Promise<WikiArticle[]> {
    return Array.from(this.wikiArticles.values());
  }
  
  async getWikiArticle(id: number): Promise<WikiArticle | undefined> {
    return this.wikiArticles.get(id);
  }
  
  async getFeaturedWikiArticles(): Promise<WikiArticle[]> {
    return Array.from(this.wikiArticles.values()).filter(article => article.isFeatured);
  }
  
  async createWikiArticle(insertArticle: InsertWikiArticle): Promise<WikiArticle> {
    const id = this.wikiArticleIdCounter++;
    const article: WikiArticle = { 
      ...insertArticle, 
      id, 
      createdAt: new Date(),
      isFeatured: insertArticle.isFeatured ?? false
    };
    this.wikiArticles.set(id, article);
    return article;
  }
  
  async updateWikiArticle(id: number, articleUpdate: Partial<InsertWikiArticle>): Promise<WikiArticle | undefined> {
    const existingArticle = this.wikiArticles.get(id);
    if (!existingArticle) return undefined;
    
    const updatedArticle = {
      ...existingArticle,
      ...articleUpdate
    };
    
    this.wikiArticles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteWikiArticle(id: number): Promise<boolean> {
    return this.wikiArticles.delete(id);
  }
  
  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    return this.appSettings;
  }
  
  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    this.appSettings = {
      ...this.appSettings!,
      ...settingsData
    };
    return this.appSettings;
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from './db-storage';

// Create the storage instance
// For Vercel deployment, always use DatabaseStorage
const storageInstance: IStorage = new DatabaseStorage();

export const storage = storageInstance;
