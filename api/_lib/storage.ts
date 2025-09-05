import { randomUUID } from "crypto";

export type PaymentRecord = {
  id: string;
  merchantTransactionId: string;
  amount: number;
  description: string;
  userId: string | null;
  status: string; // pending | success | failed
  phonepeTransactionId: string | null; // Razorpay order id or payment id
  paymentMethod: string | null;
  createdAt: Date;
};

export type LeadRecord = {
  id: string;
  email: string;
  utms: string | null;
  createdAt: Date;
};

export class MemStorageApi {
  private payments: Map<string, PaymentRecord> = new Map();
  private leads: Map<string, LeadRecord> = new Map();

  async createPayment(init: Omit<PaymentRecord, "id" | "createdAt"> & Partial<Pick<PaymentRecord, "createdAt">>): Promise<PaymentRecord> {
    const id = randomUUID();
    const payment: PaymentRecord = {
      id,
      createdAt: init.createdAt ?? new Date(),
      status: init.status ?? "pending",
      phonepeTransactionId: init.phonepeTransactionId ?? null,
      paymentMethod: init.paymentMethod ?? null,
      userId: init.userId ?? null,
      merchantTransactionId: init.merchantTransactionId,
      amount: init.amount,
      description: init.description,
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(
    merchantTransactionId: string,
    status: string,
    phonepeTransactionId?: string,
    paymentMethod?: string,
  ): Promise<PaymentRecord | undefined> {
    const found = [...this.payments.values()].find(p => p.merchantTransactionId === merchantTransactionId);
    if (!found) return undefined;
    found.status = status;
    if (phonepeTransactionId) found.phonepeTransactionId = phonepeTransactionId;
    if (paymentMethod) found.paymentMethod = paymentMethod;
    this.payments.set(found.id, found);
    return found;
  }

  async getPaymentByMerchantTransactionId(merchantTransactionId: string): Promise<PaymentRecord | undefined> {
    return [...this.payments.values()].find(p => p.merchantTransactionId === merchantTransactionId);
  }

  async createLead({ email, utms }: { email: string; utms?: string | null }): Promise<LeadRecord> {
    const id = randomUUID();
    const lead: LeadRecord = { id, email, utms: utms ?? null, createdAt: new Date() };
    this.leads.set(id, lead);
    return lead;
  }

  async getLeadByEmail(email: string): Promise<LeadRecord | undefined> {
    return [...this.leads.values()].find(l => l.email === email);
  }
}

export const storage = new MemStorageApi();


