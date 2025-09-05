import { type User, type InsertUser, type Payment, type InsertPayment, type Lead, type InsertLead } from "../shared/schema.js";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByMerchantTransactionId(merchantTransactionId: string): Promise<Payment | undefined>;
  updatePaymentStatus(merchantTransactionId: string, status: string, phonepeTransactionId?: string, paymentMethod?: string): Promise<Payment | undefined>;

  // Lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private payments: Map<string, Payment>;
  private leads: Map<string, Lead>;

  constructor() {
    this.users = new Map();
    this.payments = new Map();
    this.leads = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      status: insertPayment.status || "pending",
      phonepeTransactionId: insertPayment.phonepeTransactionId || null,
      paymentMethod: insertPayment.paymentMethod || null,
      userId: insertPayment.userId || null,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByMerchantTransactionId(merchantTransactionId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.merchantTransactionId === merchantTransactionId,
    );
  }

  async updatePaymentStatus(
    merchantTransactionId: string, 
    status: string, 
    phonepeTransactionId?: string, 
    paymentMethod?: string
  ): Promise<Payment | undefined> {
    const payment = await this.getPaymentByMerchantTransactionId(merchantTransactionId);
    if (!payment) return undefined;
    
    payment.status = status;
    if (phonepeTransactionId) payment.phonepeTransactionId = phonepeTransactionId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    
    this.payments.set(payment.id, payment);
    return payment;
  }

  // Lead methods
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = {
      id,
      email: insertLead.email,
      utms: insertLead.utms ?? null,
      createdAt: new Date(),
    } as unknown as Lead;
    this.leads.set(id, lead);
    return lead;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    return Array.from(this.leads.values()).find((lead) => lead.email === email);
  }
}

export const storage = new MemStorage();
