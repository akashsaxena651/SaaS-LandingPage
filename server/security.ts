import type { Express, Request, Response, NextFunction } from "express";

// Very small in-memory rate limiter (per IP)
type Bucket = { count: number; resetAt: number };
const globalBuckets: Map<string, Bucket> = new Map();

export function rateLimit({ windowMs, max, keyPrefix = "rl" }: { windowMs: number; max: number; keyPrefix?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = globalBuckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      globalBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= max) {
      const retryAfter = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ success: false, error: "Too many requests. Please try again later." });
    }
    bucket.count += 1;
    return next();
  };
}

export function applySecurity(app: Express) {
  // Trust reverse proxy headers (needed for correct IP and secure cookies when behind a proxy)
  app.set("trust proxy", 1);

  // Minimal security headers without external deps
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

    // Content Security Policy tuned for this app
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://checkout.razorpay.com",
      "connect-src 'self' https://www.google-analytics.com https://*.razorpay.com",
      "frame-src https://*.razorpay.com",
    ].join("; ");
    res.setHeader("Content-Security-Policy", csp);

    next();
  });
}


