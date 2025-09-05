import { z } from "zod";
import { storage } from "../server/storage";
import { sendReservationUnpaidEmail, emailEnabled } from "../server/email";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
      return res.json({ success: true });
    }

    const schema = z.object({ email: z.string().email(), utms: z.string().optional(), first_name: z.string().optional(), firstName: z.string().optional() });
    const parsed = schema.parse(req.body ?? {});
    const email = parsed.email;
    const utms = parsed.utms;
    const firstName = parsed.firstName ?? parsed.first_name;
    const existing = await storage.getLeadByEmail(email);
    if (!existing) {
      await storage.createLead({ email, utms });
    }

    if (emailEnabled()) {
      await sendReservationUnpaidEmail(email, { first_name: firstName });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Lead subscribe error:", err);
    return res.status(400).json({ success: false, error: err?.message || "Invalid payload" });
  }
}


