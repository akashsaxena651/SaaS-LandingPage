import { z } from "zod";
import { storage } from "./_lib/storage.js";
import { sendReservationUnpaidEmail, emailEnabled } from "./_lib/email.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
      return res.json({ success: true });
    }

    const schema = z.object({ email: z.string().email(), utms: z.string().nullable().optional(), first_name: z.string().optional(), firstName: z.string().optional(), send_gst_template: z.boolean().optional() });
    const parsed = schema.parse(req.body ?? {});
    const email = parsed.email;
    const utms = parsed.utms ?? null;
    const firstName = parsed.firstName ?? parsed.first_name;
    const existing = await storage.getLeadByEmail(email);
    if (!existing) {
      await storage.createLead({ email, utms });
    }

    try {
      if (parsed.send_gst_template && emailEnabled()) {
        const { sendGstTemplateEmail } = await import("./_lib/email.js");
        await sendGstTemplateEmail(email, { first_name: firstName });
      } else if (emailEnabled()) {
        await sendReservationUnpaidEmail(email, { first_name: firstName });
      }
    } catch (mailErr) {
      console.error("Lead subscribe: email send error (continuing)", mailErr);
    }

    return res.json({ success: true });
  } catch (err: any) {
    try {
      console.error("Lead subscribe error:", err);
      return res.status(400).json({ success: false, error: err?.message || "Invalid payload" });
    } catch {
      // last resort: ensure JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(400).end(JSON.stringify({ success: false, error: 'Invalid payload' }));
    }
  }
}


