import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});


export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  presenter: text("presenter").notNull(),
  presenterImage: text("presenter_image"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  registrationLink: text("registration_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});


export const wikiArticles = pgTable("wiki_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWikiArticleSchema = createInsertSchema(wikiArticles).omit({
  id: true,
  createdAt: true,
});

// Settings table for app configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  carnivalDate: text("carnival_date").notNull(),
  
  // Contact information for footer
  contactEmail: text("contact_email").default("info@sciencecarnival.edu").notNull(),
  contactPhone: text("contact_phone").default("(123) 456-7890").notNull(),
  
  // Social media links for footer
  socialFacebook: text("social_facebook").default("#").notNull(),
  socialTwitter: text("social_twitter").default("#").notNull(),
  socialInstagram: text("social_instagram").default("#").notNull(),
  socialYoutube: text("social_youtube").default("#").notNull(),
  
  // Legacy JSON fields (keeping for backward compatibility)
  socialLinks: json("social_links").$type<Record<string, string>>().notNull().default({
    facebook: "#",
    twitter: "#",
    instagram: "#",
    youtube: "#"
  }),
  contactInfo: json("contact_info").$type<Record<string, string>>().notNull().default({
    email: "info@sciencecarnival.edu",
    phone: "(123) 456-7890"
  }),
  
  // Contact form settings
  contactMail: text("contact_mail").default("mrbeak123@gmail.com").notNull(),
  
  // Website settings
  websiteSettings: json("website_settings").$type<{
    title: string;
    description: string;
    favicon: string;
    headerCode: string;
    footerCode: string;
  }>().notNull().default({
    title: "TGBHS SCIENCE FIESTA",
    description: "Explore the wonders of science at our annual TGBHS SCIENCE FIESTA",
    favicon: "",
    headerCode: "",
    footerCode: ""
  }),
  
  // Navbar customization
  navbarSettings: json("navbar_settings").$type<{
    logo: string;
    logoText: string;
    siteTitle: string;
    primaryColor: string;
    registrationLink: string;
    displayMode: "logo-only" | "logo-text";
  }>().notNull().default({
    logo: "",
    logoText: "SF",
    siteTitle: "SCIENCE FIESTA",
    primaryColor: "#3b82f6",
    registrationLink: "https://example.com/register",
    displayMode: "logo-text"
  }),
  
  // Footer customization
  footerSettings: json("footer_settings").$type<{
    logoText: string;
    tagline: string;
    description: string;
    privacyPolicyLink: string;
    termsLink: string;
    copyrightText: string;
  }>().notNull().default({
    logoText: "Science Carnival",
    tagline: "Explore, Discover, Innovate",
    description: "Join us for an unforgettable celebration of science, technology, and innovation.",
    privacyPolicyLink: "#",
    termsLink: "#",
    copyrightText: "© Science Carnival. All rights reserved."
  }),
  
  // Countdown timer customization
  countdownSettings: json("countdown_settings").$type<{
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundColor: string;
    textColor: string;
  }>().notNull().default({
    enabled: true,
    title: "The Science Carnival is coming!",
    subtitle: "Join us for a day of discovery and innovation",
    buttonText: "Register Now",
    buttonLink: "https://example.com/register",
    backgroundColor: "#0f172a",
    textColor: "#ffffff"
  }),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertWikiArticle = z.infer<typeof insertWikiArticleSchema>;
export type WikiArticle = typeof wikiArticles.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
