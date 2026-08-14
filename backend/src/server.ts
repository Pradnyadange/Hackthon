import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { applySecurityHeaders, apiRateLimiter, sanitizeInputs } from './middleware/security.middleware';
import { swaggerDocument } from './swagger';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Security Headers
app.use(applySecurityHeaders);

// 2. CORS Configuration
const allowedOrigins = process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Access denied from unauthorized origin.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsers with payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Input Sanitization against XSS & script injection
app.use(sanitizeInputs);

// 5. Global API Rate Limiting
app.use('/api', apiRateLimiter);

// Serve uploaded static document files
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'EduMatrix AI Platform API',
    timestamp: new Date()
  });
});

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount main API routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EduMatrix AI Server running securely on http://localhost:${PORT}`);
  console.log(`📄 Swagger API documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔒 Security Hardening Enabled: Rate Limiter, CSP Headers, XSS Sanitization, & RBAC Guard`);
  console.log(`====================================================`);
});
