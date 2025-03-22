import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCreditCardSchema, 
  insertIncomeDataSchema, 
  insertNotificationSchema,
  insertActionItemSchema,
  insertSimulationSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to handle zod validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: error.format() };
      }
      throw error;
    }
  };

  // Error handler middleware
  app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req, res) => {
    const { data, error } = validateRequest(insertUserSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Invalid user data", errors: error });
    }

    const existingUser = await storage.getUserByUsername(data.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const user = await storage.createUser(data);
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // In a real app, you would use proper authentication (like JWT)
    // but for this demo, we'll just return the user ID
    const { password: _, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword });
  });

  // Credit card routes
  app.get("/api/users/:userId/credit-cards", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creditCards = await storage.getCreditCards(userId);
    res.json(creditCards);
  });

  app.post("/api/users/:userId/credit-cards", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data, error } = validateRequest(insertCreditCardSchema, { ...req.body, userId });
    if (error) {
      return res.status(400).json({ message: "Invalid credit card data", errors: error });
    }

    const creditCard = await storage.createCreditCard(data);
    res.status(201).json(creditCard);
  });

  app.put("/api/credit-cards/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid credit card ID" });
    }

    const { balance, limit } = req.body;
    if (typeof balance !== 'number' || typeof limit !== 'number') {
      return res.status(400).json({ message: "Balance and limit must be numbers" });
    }

    const updatedCard = await storage.updateCreditCard(id, balance, limit);
    if (!updatedCard) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    res.json(updatedCard);
  });

  // Income data routes
  app.get("/api/users/:userId/income", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const incomeData = await storage.getIncomeData(userId);
    res.json(incomeData);
  });

  app.get("/api/users/:userId/income/summary", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lastDeposit = await storage.getLastIncomeData(userId);
    const nextExpected = await storage.getNextExpectedIncomeData(userId);

    res.json({
      lastDeposit,
      nextExpected
    });
  });

  app.post("/api/users/:userId/income", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data, error } = validateRequest(insertIncomeDataSchema, { ...req.body, userId });
    if (error) {
      return res.status(400).json({ message: "Invalid income data", errors: error });
    }

    const income = await storage.createIncomeData(data);
    res.status(201).json(income);
  });

  // Notification routes
  app.get("/api/users/:userId/notifications", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = await storage.getNotifications(userId);
    res.json(notifications);
  });

  app.post("/api/users/:userId/notifications", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data, error } = validateRequest(insertNotificationSchema, { ...req.body, userId });
    if (error) {
      return res.status(400).json({ message: "Invalid notification data", errors: error });
    }

    const notification = await storage.createNotification(data);
    res.status(201).json(notification);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const updatedNotification = await storage.markNotificationAsRead(id);
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(updatedNotification);
  });

  // Action items routes
  app.get("/api/users/:userId/action-items", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const actionItems = await storage.getActionItems(userId);
    res.json(actionItems);
  });

  app.post("/api/users/:userId/action-items", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data, error } = validateRequest(insertActionItemSchema, { ...req.body, userId });
    if (error) {
      return res.status(400).json({ message: "Invalid action item data", errors: error });
    }

    const actionItem = await storage.createActionItem(data);
    res.status(201).json(actionItem);
  });

  app.patch("/api/action-items/:id/complete", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action item ID" });
    }

    const updatedActionItem = await storage.completeActionItem(id);
    if (!updatedActionItem) {
      return res.status(404).json({ message: "Action item not found" });
    }

    res.json(updatedActionItem);
  });

  // Simulation routes
  app.get("/api/users/:userId/simulations", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const simulations = await storage.getSimulations(userId);
    res.json(simulations);
  });

  app.post("/api/users/:userId/simulations", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { data, error } = validateRequest(insertSimulationSchema, { ...req.body, userId });
    if (error) {
      return res.status(400).json({ message: "Invalid simulation data", errors: error });
    }

    const simulation = await storage.createSimulation(data);
    res.status(201).json(simulation);
  });

  // Calculate overall credit utilization
  app.get("/api/users/:userId/credit-utilization", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const creditCards = await storage.getCreditCards(userId);
    if (creditCards.length === 0) {
      return res.json({ overall: 0, status: "none" });
    }

    let totalBalance = 0;
    let totalLimit = 0;

    creditCards.forEach(card => {
      totalBalance += card.balance;
      totalLimit += card.limit;
    });

    const overallUtilization = (totalBalance / totalLimit) * 100;
    
    let status = "good";
    if (overallUtilization > 50) status = "high";
    else if (overallUtilization > 30) status = "moderate";
    else status = "good";

    res.json({
      overall: Math.round(overallUtilization),
      status
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
