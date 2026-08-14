export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'EduMatrix AI School Operations Management Platform API',
    version: '1.0.0',
    description: 'Production-ready REST API documentation for EduMatrix platform. Supports full authentication, student & staff operations, AI timetable generation, document OCR, attendance tracking, and proactive alert engine.'
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Check Backend Health',
        responses: {
          200: { description: 'Server online status' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'User Authentication Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@school.com' },
                  password: { type: 'string', example: 'admin123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Returns JWT session token and user profile' }
        }
      }
    },
    '/students': {
      get: { summary: 'Get all students with filtering & pagination' },
      post: { summary: 'Add a new student' }
    },
    '/teachers': {
      get: { summary: 'Get all teachers' },
      post: { summary: 'Create a new teacher profile' }
    },
    '/timetable/generate': {
      post: { summary: 'Run Smart AI Timetable Generation Algorithm' }
    },
    '/documents/upload': {
      post: { summary: 'Upload paper form & run AI OCR Extraction' }
    },
    '/attendance': {
      get: { summary: 'Get class attendance sheet' },
      post: { summary: 'Save bulk student attendance' }
    },
    '/alerts': {
      get: { summary: 'Get active Action Required proactive system alerts' }
    }
  }
};
