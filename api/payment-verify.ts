import CryptoJS from "crypto-js";
import { storage } from "../server/storage.js";
import { sendReservationPaidEmail, emailEnabled } from "../server/email.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, merchantTransactionId } = req.body || {};
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!keySecret) {
      return res.status(500).json({ success: false, error: "Missing Razorpay secret" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = CryptoJS.HmacSHA256(body, keySecret).toString();

    if (expected !== razorpay_signature) {
      await storage.updatePaymentStatus(merchantTransactionId, "failed");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    await storage.updatePaymentStatus(merchantTransactionId, "success", razorpay_payment_id, "UPI/Card/NetBanking");

    try {
      const to = req.body?.email;
      if (to && emailEnabled()) {
        await sendReservationPaidEmail(to, {
          first_name: req.body.first_name || req.body.firstName || "",
          order_id: merchantTransactionId,
          amount: `₹${parseInt(process.env.PRICE_INR || "999", 10)}`,
          payment_method: "UPI/Card/NetBanking",
          paid_at: new Date().toLocaleString(),
        });
      }
    } catch (e) {
      console.error("Email send error:", e);
    }

    return res.json({ success: true, verified: true });
  } catch (e) {
    console.error("Verify error:", e);
    return res.status(500).json({ success: false, error: "Verification failed" });
  }
}


