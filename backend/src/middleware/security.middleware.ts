import { Request, Response, NextFunction } from 'express';

// Rate Limiter Memory Store
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const apiRequests = new Map<string, { count: number; firstAttempt: number }>();

/**
 * Security Headers Middleware (Helmet equivalent)
 */
export const applySecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:;"
  );
  next();
};

/**
 * Rate Limiter for Authentication / Login Endpoints (Prevents Brute-Force Attacks)
 */
export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 10;

  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (now - record.firstAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Please try again after 15 minutes for security.'
    });
  }

  record.count += 1;
  next();
};

/**
 * Global API Rate Limiter
 */
export const apiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxRequests = 10000; // Increased threshold for high-frequency dashboard monitoring & testing

  const record = apiRequests.get(ip);

  if (!record) {
    apiRequests.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (now - record.firstAttempt > windowMs) {
    apiRequests.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'API request limit exceeded. Please slow down.'
    });
  }

  record.count += 1;
  next();
};

/**
 * Input Sanitization Middleware (XSS & Injection Protection)
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
