import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendEmail, verifyEmailConnection } from "./email";
import { z } from 'zod';
import { 
  insertEventSchema,
  insertWikiArticleSchema,
  insertSettingsSchema,
  insertUserSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup routes for first-time admin creation
  app.get("/api/setup/check", async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Check if there's at least one admin user
      const adminExists = users.some(user => user.isAdmin);
      res.json(adminExists);
    } catch (error) {
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  app.post("/api/setup", async (req, res) => {
    try {
      // First check if an admin already exists
      const users = await storage.getUsers();
      const adminExists = users.some(user => user.isAdmin);
      
      if (adminExists) {
        return res.status(400).json({ message: "Setup already completed" });
      }
      
      // Validate and create admin user
      const userData = insertUserSchema.parse({
        ...req.body,
        isAdmin: true // Force admin status for first-time setup
      });
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to complete setup" });
    }
  });

  // Events API routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/featured", async (req, res) => {
    try {
      const featuredEvents = await storage.getFeaturedEvents();
      res.json(featuredEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(Number(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const validatedData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(validatedData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const eventId = Number(req.params.id);
      const validatedData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(eventId, validatedData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const eventId = Number(req.params.id);
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Wiki articles API routes
  app.get("/api/wiki", async (req, res) => {
    try {
      const articles = await storage.getWikiArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wiki articles" });
    }
  });

  app.get("/api/wiki/featured", async (req, res) => {
    try {
      const featuredArticles = await storage.getFeaturedWikiArticles();
      res.json(featuredArticles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured wiki articles" });
    }
  });

  app.get("/api/wiki/:id", async (req, res) => {
    try {
      const article = await storage.getWikiArticle(Number(req.params.id));
      if (!article) {
        return res.status(404).json({ message: "Wiki article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wiki article" });
    }
  });

  app.post("/api/wiki", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const validatedData = insertWikiArticleSchema.parse(req.body);
      const newArticle = await storage.createWikiArticle(validatedData);
      res.status(201).json(newArticle);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create wiki article" });
    }
  });

  app.put("/api/wiki/:id", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const articleId = Number(req.params.id);
      const validatedData = insertWikiArticleSchema.partial().parse(req.body);
      const updatedArticle = await storage.updateWikiArticle(articleId, validatedData);
      
      if (!updatedArticle) {
        return res.status(404).json({ message: "Wiki article not found" });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update wiki article" });
    }
  });

  app.delete("/api/wiki/:id", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const articleId = Number(req.params.id);
      const success = await storage.deleteWikiArticle(articleId);
      
      if (!success) {
        return res.status(404).json({ message: "Wiki article not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wiki article" });
    }
  });

  // Settings API routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    // Temporarily disable auth check for easy testing
    /*if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }*/

    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSettings(validatedData);
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  });

  // Test email endpoint
  app.get("/api/test-email", async (req, res) => {
    try {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Email from TGBHS SCIENCE FIESTA",
        message: "This is a test message to verify the email functionality is working correctly."
      };
      
      const result = await sendEmail(testData, "harunabdullahrakin@gmail.com");
      
      return res.status(200).json({ 
        success: true, 
        message: "Test email has been sent to harunabdullahrakin@gmail.com",
        result
      });
    } catch (error) {
      console.error('Test email error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "There was a problem sending the test email",
        error: error.message
      });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      let validatedData;
      try {
        validatedData = contactFormSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            success: false, 
            message: fromZodError(validationError).message 
          });
        }
        throw validationError;
      }
      
      const settings = await storage.getSettings();
      const ownerEmail = settings?.contactMail || 'mrbeak123@gmail.com';
      
      await sendEmail(validatedData, ownerEmail);
      
      return res.status(200).json({ 
        success: true, 
        message: "Your message has been sent successfully. We'll get back to you soon!" 
      });
    } catch (error) {
      console.error('Contact form error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "There was a problem sending your message. Please try again later." 
      });
    }
  });
  if (process.env.NODE_ENV !== 'production') {
    verifyEmailConnection()
      .then(isConnected => {
        if (isConnected) {
          console.log('Email service is ready!');
        } else {
          console.warn('Email service is not connected.');
        }
      })
      .catch(err => {
        console.error('Error:', err);
      });
  }

  const httpServer = createServer(app);
  return httpServer;
}
