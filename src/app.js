const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const apiLimiter = require('./middleware/rateLimiter');

// Initialize Express App
const app = express();

// 1. Global Pre-middlewares
// Security Headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Compress all HTTP responses
app.use(compression());

// Parse incoming request JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging with Morgan
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 2. Rate Limiting Middleware
// Apply rate limiter to all API endpoints
app.use(apiLimiter);

// 3. API Router
app.use('/', routes);

// 4. Post-middlewares (Error Handling)
// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
