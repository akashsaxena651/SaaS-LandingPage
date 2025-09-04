import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendReservationPaidEmail, sendReservationUnpaidEmail, emailEnabled } from "./email";
import { insertPaymentSchema, insertLeadSchema } from "@shared/schema";
import Razorpay from "razorpay";
import CryptoJS from "crypto-js";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Razorpay Payment Gateway Integration
  
  // Subscribe lead and send confirmation
  app.post("/api/leads/subscribe", async (req, res) => {
    try {
      // Simple honeypot field to block bots
      if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
        return res.json({ success: true });
      }

      const { email, utms, firstName } = insertLeadSchema.parse({ ...req.body, firstName: req.body.firstName ?? req.body.first_name });
      const existing = await storage.getLeadByEmail(email);
      if (!existing) {
        await storage.createLead({ email, utms });
      }

      // Also send a professional reserved-but-unpaid email if global SMTP config is present
      if (emailEnabled()) {
        await sendReservationUnpaidEmail(email, { first_name: firstName });
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error("Lead subscribe error:", err);
      return res.status(400).json({ success: false, error: err?.message || "Invalid payload" });
    }
  });

  // Create Razorpay order and store in database
  app.post("/api/payment/create", async (req, res) => {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID || "";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      const priceInr = Number.parseInt(process.env.PRICE_INR || "999", 10);
      const productDescription = process.env.PRODUCT_DESCRIPTION || "InvoiceBolt Lifetime Access";
      if (!keyId || !keySecret) {
        return res.status(500).json({
          success: false,
          error: "Razorpay environment variables missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        });
      }
      const validatedData = insertPaymentSchema.parse(req.body);
      const ctaVariant: string | undefined = typeof req.body.ctaVariant === 'string' ? req.body.ctaVariant : undefined;
      
      const merchantTransactionId = `TXN_${Date.now()}_${randomUUID().slice(0, 8)}`;
      
      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: priceInr * 100, // force server-side amount in paise
        currency: "INR",
        receipt: merchantTransactionId,
        notes: {
          description: productDescription,
          userId: validatedData.userId || "anonymous",
          ctaVariant: ctaVariant || 'na',
        }
      });

      // Store payment in database
      const payment = await storage.createPayment({
        merchantTransactionId,
        amount: priceInr,
        description: productDescription,
        userId: validatedData.userId,
        status: "pending",
        phonepeTransactionId: razorpayOrder.id, // Store Razorpay order ID
      });

      res.json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        merchantTransactionId: merchantTransactionId,
        key: keyId
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid payment data" 
      });
    }
  });

  // Verify payment and update status
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, merchantTransactionId } = req.body;

      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (!keySecret) {
        return res.status(500).json({
          success: false,
          error: "Razorpay environment variables missing. Please set RAZORPAY_KEY_SECRET.",
        });
      }

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = CryptoJS.HmacSHA256(body, keySecret).toString();

      if (expectedSignature === razorpay_signature) {
        // Payment is verified, update status
        await storage.updatePaymentStatus(
          merchantTransactionId,
          "success",
          razorpay_payment_id,
          "UPI/Card/NetBanking"
        );
        // Try sending a receipt email if the lead exists (best-effort)
        try {
          const lead = await storage.getLeadByEmail(req.body.email || "");
          const to = req.body.email || lead?.email;
          if (to && emailEnabled()) {
            await sendReservationPaidEmail(to, {
              first_name: req.body.first_name || req.body.firstName || "",
              order_id: merchantTransactionId,
              amount: String(req.body.amount || ""),
              payment_method: "UPI/Card/NetBanking",
              paid_at: new Date().toLocaleString(),
            });
          }
        } catch (e) {
          console.error("sendReceipt email error:", e);
        }

        res.json({ success: true, verified: true });
      } else {
        // Signature verification failed
        await storage.updatePaymentStatus(merchantTransactionId, "failed");
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });

  // Handle payment failure
  app.post("/api/payment/failed", async (req, res) => {
    try {
      const { merchantTransactionId, error } = req.body;
      
      await storage.updatePaymentStatus(merchantTransactionId, "failed");
      
      res.json({ success: true });
    } catch (error) {
      console.error("Payment failure handling error:", error);
      res.status(500).json({ success: false });
    }
  });

  // Get payment status
  app.get("/api/payment/status/:merchantTransactionId", async (req, res) => {
    try {
      const { merchantTransactionId } = req.params;
      const payment = await storage.getPaymentByMerchantTransactionId(merchantTransactionId);
      
      if (!payment) {
        return res.status(404).json({ success: false, error: "Payment not found" });
      }

      res.json({
        success: true,
        payment: {
          id: payment.id,
          merchantTransactionId: payment.merchantTransactionId,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          razorpayPaymentId: payment.phonepeTransactionId
        }
      });
    } catch (error) {
      console.error("Payment status error:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
