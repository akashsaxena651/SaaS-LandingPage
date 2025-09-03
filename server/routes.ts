import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaymentSchema } from "@shared/schema";
import Razorpay from "razorpay";
import CryptoJS from "crypto-js";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Razorpay Payment Gateway Integration
  
  // Create Razorpay order and store in database
  app.post("/api/payment/create", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      
      const merchantTransactionId = `TXN_${Date.now()}_${randomUUID().slice(0, 8)}`;
      
      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "",
      });

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: validatedData.amount * 100, // amount in paise
        currency: "INR",
        receipt: merchantTransactionId,
        notes: {
          description: validatedData.description,
          userId: validatedData.userId || "anonymous"
        }
      });

      // Store payment in database
      const payment = await storage.createPayment({
        merchantTransactionId,
        amount: validatedData.amount,
        description: validatedData.description,
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
        key: process.env.RAZORPAY_KEY_ID
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

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = CryptoJS.HmacSHA256(body, process.env.RAZORPAY_KEY_SECRET || "").toString();

      if (expectedSignature === razorpay_signature) {
        // Payment is verified, update status
        await storage.updatePaymentStatus(
          merchantTransactionId,
          "success",
          razorpay_payment_id,
          "UPI/Card/NetBanking"
        );

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
