import Razorpay from "razorpay";
import { insertPaymentSchema } from "../shared/schema.ts";
import { storage } from "../server/storage.ts";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    const key_id = process.env.RAZORPAY_KEY_ID || "";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!key_id || !key_secret) {
      return res.status(500).json({ success: false, error: "Missing Razorpay keys" });
    }

    const priceInr = Number.parseInt(process.env.PRICE_INR || "999", 10);
    const productDescription = process.env.PRODUCT_DESCRIPTION || "InvoiceBolt Lifetime Access";
    const data = insertPaymentSchema.parse(req.body);
    const ctaVariant = typeof req.body?.ctaVariant === "string" ? req.body.ctaVariant : "na";
    const merchantTransactionId = `TXN_${Date.now()}`;

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: priceInr * 100,
      currency: "INR",
      receipt: merchantTransactionId,
      notes: { description: productDescription, userId: data.userId || "anonymous", ctaVariant },
    });

    await storage.createPayment({
      merchantTransactionId,
      amount: priceInr,
      description: productDescription,
      userId: data.userId,
      status: "pending",
      phonepeTransactionId: order.id,
    });

    return res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, merchantTransactionId, key: key_id });
  } catch (e: any) {
    console.error("Payment create error:", e);
    return res.status(400).json({ success: false, error: e?.message || "Invalid payment data" });
  }
}


