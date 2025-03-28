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
    // Create demo user with lower credit score (target audience)
    const demoUser: User = {
      id: this.userId++,
      username: "alexthompson",
      password: "password123", // In a real app, this would be hashed
      name: "Alex Thompson",
      email: "alex@example.com",
      avatarInitials: "AT",
      creditScore: 650,
      creditScoreStatus: "fair",
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo credit cards with high utilization (typical for lower credit scores)
    const visaCard: CreditCard = {
      id: this.creditCardId++,
      userId: demoUser.id,
      name: "Visa Signature",
      balance: 3800,
      limit: 5000,
      utilization: 76, // High utilization contributing to lower score
      isConnected: true
    };
    this.creditCards.set(visaCard.id, visaCard);

    const amexCard: CreditCard = {
      id: this.creditCardId++,
      userId: demoUser.id,
      name: "Chase Freedom",
      balance: 3200,
      limit: 4000,
      utilization: 80, // High utilization contributing to lower score
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

    // Create notifications tailored for user with poor credit health
    const notifications = [
      {
        message: "Hi Alex, let's work together to improve your 650 credit score!",
        type: "info",
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        message: "Your credit utilization is at 78% - high utilization is hurting your score",
        type: "warning",
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        message: "Your credit score decreased by 8 points this month - let's take action",
        type: "warning", 
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        message: "You saved $15 on groceries last week with smart swaps - apply this to debt!",
        type: "success",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        message: "We've analyzed your spending - see the 3 areas you can cut back",
        type: "info",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        message: "You've successfully connected all your accounts - we found 4 areas to improve",
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

    // Create action items focused on credit improvement
    const actionItems = [
      {
        title: "URGENT: Pay $750 to Your Visa Card",
        description: "Your 76% utilization is damaging your score. Paying $750 could boost your score by ~30 points next month!",
        type: "warning",
        actionButton: "Schedule Payment"
      },
      {
        title: "Dispute Old Collections Account",
        description: "We found a potentially outdated collections account from 2019 that might be removable.",
        type: "warning",
        actionButton: "Start Dispute"
      },
      {
        title: "Scan Grocery Receipts to Save",
        description: "Find cheaper alternatives - every $100 saved can be put toward reducing your high credit utilization.",
        type: "info",
        actionButton: "Open Scanner"
      },
      {
        title: "Create Repayment Plan",
        description: "See how paying off $1500 over the next 4 months could bring your credit score above 700.",
        type: "info",
        actionButton: "Try Simulator"
      },
      {
        title: "Set Up Automatic Payments",
        description: "Late payments are affecting your score. Set up automatic payments to never miss a due date.",
        type: "warning",
        actionButton: "Set Up Now"
      },
      {
        title: "Weekly Debt Reduction Goal",
        description: "You've applied $15 to debt this week. Try to reach your goal of $50 by finding more savings.",
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

    // Create a default simulation starting from the low score
    const simulation: Simulation = {
      id: this.simulationId++,
      userId: demoUser.id,
      baseScore: 650,
      potentialScore: 703, // Achievable with debt reduction and on-time payments
      payDownDebt: 2000, // More aggressive debt reduction needed for low score
      newCreditCard: false,
      onTimePayments: 6, // Need more consistent payments to show improvement
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
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      creditScore: insertUser.creditScore || null,
      creditScoreStatus: insertUser.creditScoreStatus || null
    };
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
    const card: CreditCard = { 
      ...insertCard, 
      id,
      isConnected: insertCard.isConnected || null
    };
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
