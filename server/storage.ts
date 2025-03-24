import { 
  users, type User, type InsertUser,
  creditCards, type CreditCard, type InsertCreditCard,
  incomeData, type IncomeData, type InsertIncomeData,
  notifications, type Notification, type InsertNotification,
  actionItems, type ActionItem, type InsertActionItem,
  simulations, type Simulation, type InsertSimulation
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCreditScore(userId: number, creditScore: number): Promise<User | undefined>;
  
  // Credit card operations
  getCreditCards(userId: number): Promise<CreditCard[]>;
  getCreditCard(id: number): Promise<CreditCard | undefined>;
  createCreditCard(card: InsertCreditCard): Promise<CreditCard>;
  updateCreditCard(id: number, balance: number, limit: number): Promise<CreditCard | undefined>;
  
  // Income data operations
  getIncomeData(userId: number): Promise<IncomeData[]>;
  createIncomeData(income: InsertIncomeData): Promise<IncomeData>;
  getLastIncomeData(userId: number): Promise<IncomeData | undefined>;
  getNextExpectedIncomeData(userId: number): Promise<IncomeData | undefined>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Action item operations
  getActionItems(userId: number): Promise<ActionItem[]>;
  createActionItem(actionItem: InsertActionItem): Promise<ActionItem>;
  completeActionItem(id: number): Promise<ActionItem | undefined>;
  
  // Simulation operations
  getSimulations(userId: number): Promise<Simulation[]>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  getSimulation(id: number): Promise<Simulation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private creditCards: Map<number, CreditCard>;
  private incomeData: Map<number, IncomeData>;
  private notifications: Map<number, Notification>;
  private actionItems: Map<number, ActionItem>;
  private simulations: Map<number, Simulation>;
  
  private userId: number;
  private creditCardId: number;
  private incomeDataId: number;
  private notificationId: number;
  private actionItemId: number;
  private simulationId: number;

  constructor() {
    this.users = new Map();
    this.creditCards = new Map();
    this.incomeData = new Map();
    this.notifications = new Map();
    this.actionItems = new Map();
    this.simulations = new Map();
    
    this.userId = 1;
    this.creditCardId = 1;
    this.incomeDataId = 1;
    this.notificationId = 1;
    this.actionItemId = 1;
    this.simulationId = 1;
    
    // Initialize with a demo user and data
    this.initializeDemoData();
  }

  // Initialize demo data
  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: this.userId++,
      username: "alexsmith",
      password: "password123", // In a real app, this would be hashed
      name: "Alex Smith",
      email: "alex@example.com",
      avatarInitials: "AS",
      creditScore: 736,
      creditScoreStatus: "good",
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo credit cards
    const visaCard: CreditCard = {
      id: this.creditCardId++,
      userId: demoUser.id,
      name: "Visa Signature",
      balance: 2500,
      limit: 5000,
      utilization: 50,
      isConnected: true
    };
    this.creditCards.set(visaCard.id, visaCard);

    const amexCard: CreditCard = {
      id: this.creditCardId++,
      userId: demoUser.id,
      name: "Chase Freedom",
      balance: 1800,
      limit: 4000,
      utilization: 45,
      isConnected: true
    };
    this.creditCards.set(amexCard.id, amexCard);

    // Create income data
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(15);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(15);

    const lastIncome: IncomeData = {
      id: this.incomeDataId++,
      userId: demoUser.id,
      amount: 3450,
      date: lastMonth,
      isExpected: false
    };
    this.incomeData.set(lastIncome.id, lastIncome);

    const nextIncome: IncomeData = {
      id: this.incomeDataId++,
      userId: demoUser.id,
      amount: 3450,
      date: nextMonth,
      isExpected: true
    };
    this.incomeData.set(nextIncome.id, nextIncome);

    // Create notifications
    const notifications = [
      {
        message: "Hi Alex, let's start improving your financial health!",
        type: "info",
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        message: "You're using 50% of your credit - that's above the recommended usage",
        type: "warning",
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        message: "You saved $15 on groceries last week with smart swaps - great job!",
        type: "success",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        message: "Your weekly spending report is ready to view",
        type: "info",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        message: "You've successfully connected all your bank accounts",
        type: "success",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      }
    ];

    notifications.forEach(notif => {
      const notification: Notification = {
        id: this.notificationId++,
        userId: demoUser.id,
        message: notif.message,
        type: notif.type,
        isRead: false,
        createdAt: notif.createdAt
      };
      this.notifications.set(notification.id, notification);
    });

    // Create action items
    const actionItems = [
      {
        title: "Pay $300 to Your Visa Card",
        description: "Paying $300 will lower your utilization to ~35% and could boost your score by ~20 points next month!",
        type: "warning",
        actionButton: "Schedule Payment"
      },
      {
        title: "Scan Grocery Receipts",
        description: "Use our grocery scanner to find cheaper alternatives and save on your next shopping trip.",
        type: "info",
        actionButton: "Open Scanner"
      },
      {
        title: "Try 'What-If' Simulator",
        description: "See how paying off $1000 over the next 3 months could improve your credit score.",
        type: "info",
        actionButton: "Try Simulator"
      },
      {
        title: "Weekly Savings Goal",
        description: "You've saved $15 so far this week. Try to reach your goal of $25 by finding more savings opportunities.",
        type: "success",
        actionButton: "Find Savings"
      }
    ];

    actionItems.forEach(item => {
      const actionItem: ActionItem = {
        id: this.actionItemId++,
        userId: demoUser.id,
        title: item.title,
        description: item.description,
        type: item.type,
        actionButton: item.actionButton,
        isCompleted: false,
        createdAt: new Date()
      };
      this.actionItems.set(actionItem.id, actionItem);
    });

    // Create a default simulation
    const simulation: Simulation = {
      id: this.simulationId++,
      userId: demoUser.id,
      baseScore: 736,
      potentialScore: 771,
      payDownDebt: 1000,
      newCreditCard: false,
      onTimePayments: 3,
      createdAt: new Date()
    };
    this.simulations.set(simulation.id, simulation);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserCreditScore(userId: number, creditScore: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    let creditScoreStatus = user.creditScoreStatus;
    
    if (creditScore < 580) creditScoreStatus = "poor";
    else if (creditScore < 670) creditScoreStatus = "fair";
    else if (creditScore < 740) creditScoreStatus = "good";
    else if (creditScore < 800) creditScoreStatus = "very_good";
    else creditScoreStatus = "excellent";

    const updatedUser: User = { ...user, creditScore, creditScoreStatus };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Credit card operations
  async getCreditCards(userId: number): Promise<CreditCard[]> {
    return Array.from(this.creditCards.values()).filter(
      (card) => card.userId === userId,
    );
  }

  async getCreditCard(id: number): Promise<CreditCard | undefined> {
    return this.creditCards.get(id);
  }

  async createCreditCard(insertCard: InsertCreditCard): Promise<CreditCard> {
    const id = this.creditCardId++;
    const card: CreditCard = { ...insertCard, id };
    this.creditCards.set(id, card);
    return card;
  }

  async updateCreditCard(id: number, balance: number, limit: number): Promise<CreditCard | undefined> {
    const card = await this.getCreditCard(id);
    if (!card) return undefined;
    
    const utilization = (balance / limit) * 100;
    const updatedCard: CreditCard = { ...card, balance, limit, utilization };
    this.creditCards.set(id, updatedCard);
    return updatedCard;
  }

  // Income data operations
  async getIncomeData(userId: number): Promise<IncomeData[]> {
    return Array.from(this.incomeData.values()).filter(
      (income) => income.userId === userId,
    );
  }

  async createIncomeData(insertIncome: InsertIncomeData): Promise<IncomeData> {
    const id = this.incomeDataId++;
    const income: IncomeData = { ...insertIncome, id };
    this.incomeData.set(id, income);
    return income;
  }

  async getLastIncomeData(userId: number): Promise<IncomeData | undefined> {
    const userIncomes = await this.getIncomeData(userId);
    const pastIncomes = userIncomes.filter(income => !income.isExpected && income.date <= new Date());
    return pastIncomes.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }

  async getNextExpectedIncomeData(userId: number): Promise<IncomeData | undefined> {
    const userIncomes = await this.getIncomeData(userId);
    const futureIncomes = userIncomes.filter(income => income.isExpected && income.date > new Date());
    return futureIncomes.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Action item operations
  async getActionItems(userId: number): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter(
      (item) => item.userId === userId && !item.isCompleted,
    );
  }

  async createActionItem(insertActionItem: InsertActionItem): Promise<ActionItem> {
    const id = this.actionItemId++;
    const actionItem: ActionItem = { ...insertActionItem, id, createdAt: new Date() };
    this.actionItems.set(id, actionItem);
    return actionItem;
  }

  async completeActionItem(id: number): Promise<ActionItem | undefined> {
    const actionItem = this.actionItems.get(id);
    if (!actionItem) return undefined;
    
    const updatedActionItem: ActionItem = { ...actionItem, isCompleted: true };
    this.actionItems.set(id, updatedActionItem);
    return updatedActionItem;
  }

  // Simulation operations
  async getSimulations(userId: number): Promise<Simulation[]> {
    return Array.from(this.simulations.values())
      .filter((simulation) => simulation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const id = this.simulationId++;
    const simulation: Simulation = { ...insertSimulation, id, createdAt: new Date() };
    this.simulations.set(id, simulation);
    return simulation;
  }

  async getSimulation(id: number): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }
}

export const storage = new MemStorage();
