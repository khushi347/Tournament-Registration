# 🏆 Tournament Registration & Leaderboard System

A production-ready RESTful backend built with **Node.js**, **Express.js**, and **MongoDB** for managing tournament registrations, score submissions, and dynamic leaderboards.

Developed as part of a **Backend Engineering Internship Assessment**, this project demonstrates clean architecture, modular design, robust validation, centralized error handling, and scalable REST API development following industry best practices.

---

# Overview

This application enables players to register, participate in tournaments, submit scores, and view real-time rankings. It focuses on building a maintainable backend by separating concerns into controllers, services, models, middleware, and validators while ensuring data integrity through business rule enforcement.

---

# Key Features

### Player Management

* Create players with validation
* Enforce unique email addresses
* Prevent invalid requests

### Tournament Management

* Create tournaments
* Configurable tournament capacity
* Input validation

### Tournament Registration

* Register players to tournaments
* Prevent duplicate registrations
* Enforce maximum player limit
* Validate player and tournament existence

### Score Management

* Submit tournament scores
* Update existing scores
* Reject invalid score submissions
* Allow scoring only for registered players

### Leaderboard

* Dynamic leaderboard generation
* Ranking based on highest score
* Alphabetical tie-breaker for equal scores
* Individual player rank lookup

---

# Technical Highlights

* Modular MVC Architecture
* Service Layer for Business Logic
* Centralized Error Handling
* Custom API Response Structure
* Request Validation using `express-validator`
* Compound Indexes for Data Integrity
* MongoDB Aggregation for Ranking
* Async/Await Throughout
* Environment-based Configuration
* Graceful Database Shutdown
* Security Middleware
* Integration Test Coverage

---

# Tech Stack

| Category      | Technology         |
| ------------- | ------------------ |
| Runtime       | Node.js            |
| Framework     | Express.js         |
| Database      | MongoDB            |
| ODM           | Mongoose           |
| Validation    | express-validator  |
| Logging       | Morgan             |
| Security      | Helmet             |
| CORS          | cors               |
| Compression   | compression        |
| Rate Limiting | express-rate-limit |
| Environment   | dotenv             |

---

# Project Architecture

```text
src/
├── config/
├── constants/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── app.js
└── server.js
```

The application follows a layered architecture where:

* **Routes** define API endpoints.
* **Validators** validate incoming requests.
* **Controllers** coordinate request handling.
* **Services** contain business logic.
* **Models** interact with MongoDB.
* **Middleware** manages validation, errors, and security.
* **Utilities** provide reusable helpers.

---

# Database Design

## Player

| Field   | Description          |
| ------- | -------------------- |
| name    | Player name          |
| email   | Unique email address |
| country | Country              |

---

## Tournament

| Field      | Description             |
| ---------- | ----------------------- |
| name       | Tournament name         |
| maxPlayers | Maximum allowed players |

---

## Registration

| Field      | Description          |
| ---------- | -------------------- |
| tournament | Tournament reference |
| player     | Player reference     |

**Compound Unique Index**

```
(tournament, player)
```

Prevents duplicate registrations.

---

## Score

| Field      | Description          |
| ---------- | -------------------- |
| tournament | Tournament reference |
| player     | Player reference     |
| score      | Player score         |

**Compound Unique Index**

```
(tournament, player)
```

Allows score updates while maintaining uniqueness.

---

# API Endpoints

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/health`                           | Application health check |
| POST   | `/players`                          | Create player            |
| POST   | `/tournaments`                      | Create tournament        |
| POST   | `/tournaments/:id/register`         | Register player          |
| POST   | `/tournaments/:id/score`            | Submit or update score   |
| GET    | `/tournaments/:id/leaderboard`      | Tournament leaderboard   |
| GET    | `/tournaments/:id/player/:playerId` | Player rank and score    |

---

# Validation Rules

### Player

* Name is required
* Email must be valid
* Email must be unique
* Country is required

### Tournament

* Tournament name is required
* Maximum players must be greater than zero

### Registration

* Player must exist
* Tournament must exist
* Duplicate registration is not allowed
* Tournament capacity cannot be exceeded

### Score

* Player must be registered
* Score must be greater than or equal to zero

---

# Sample Success Response

```json
{
  "success": true,
  "message": "Player created successfully",
  "data": {}
}
```

---

# Sample Error Response

```json
{
  "success": false,
  "message": "Player is already registered for this tournament"
}
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/khushi347/Tournament-Registration
cd tournament-registration-system
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/tournament_db
NODE_ENV=development
```

Start the development server:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

# Testing

The application has been tested for:

* Player creation
* Tournament creation
* Duplicate email validation
* Tournament capacity validation
* Duplicate registration prevention
* Score submission
* Score updates
* Leaderboard generation
* Tie-breaker handling
* Player rank calculation
* Invalid request handling
* API error responses

Run tests:

```bash
npm test
```

or

```bash
node tests/verify.js
```

---

# Engineering Decisions

* Business logic is isolated inside the **Service Layer**.
* Controllers remain lightweight and focused on request handling.
* Compound indexes ensure database-level consistency.
* Consistent API response structure improves client integration.
* Global error middleware eliminates repetitive error handling.
* Validation is performed before business logic execution.
* MongoDB aggregation is used for efficient leaderboard and ranking calculations.

---

# Future Enhancements

* JWT Authentication & Authorization
* Swagger/OpenAPI Documentation
* Docker Support
* CI/CD Pipeline
* Redis Caching
* Real-time Leaderboards using WebSockets
* Tournament Scheduling
* Team-based Competitions

---

# Author

**Khushi Sharma**

Backend Engineering Internship Assignment

Built with a focus on clean architecture, scalability, maintainability, and production-ready REST API design.
