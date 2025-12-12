# Auctionary Backend Implementation Summary

## Project Overview
This is a complete implementation of the Auctionary REST API backend for the Full Stack Web Development assignment 25/26. The backend implements a full-featured auction management system with user authentication, item listings, bidding, and Q&A functionality.

## ✅ Implementation Status

### Backend (100% Complete) - 45% of Grade
- **All automated tests passing**: 128/128 ✓
- **All required endpoints implemented** ✓
- **All extension tasks completed** ✓

### Frontend (Not Started) - 30% of Grade
- Vue 3 application pending implementation
- UX/Design pending (15% of grade)

## 📋 Implemented Features

### Core API Endpoints

#### User Management
- `POST /users` - Create new user account with validation
  - Password requirements: 8-40 chars, uppercase, lowercase, number, special char
  - Email uniqueness validation
  - Automatic password hashing with salt

- `GET /users/:id` - Get user profile
  - Returns selling items, bidding items, and archived auctions

#### Authentication
- `POST /login` - User login with session token generation
  - Returns same token if already logged in
  - Email and password validation

- `POST /logout` - User logout (requires authentication)

#### Items/Auctions
- `POST /item` - Create auction item (requires authentication)
  - Fields: name, description, starting_bid, end_date
  - Optional: categories (array of category IDs)
  - Automatic start_date timestamp
  - **Profanity filtering applied**

- `GET /item/:id` - Get auction details
  - Includes current bid information
  - Shows bid holder details

#### Bidding
- `POST /item/:id/bid` - Place a bid (requires authentication)
  - Validates bid amount > current bid
  - Prevents bidding on own items
  - Returns 403 for own items, 404 for non-existent items

- `GET /item/:id/bid` - Get bid history
  - Returns all bids sorted by amount (highest first)
  - Includes bidder information

#### Questions & Answers
- `POST /item/:id/question` - Ask question (requires authentication)
  - Prevents questions on own items
  - **Profanity filtering applied**

- `GET /item/:id/question` - Get all questions on an item
  - Sorted by newest first
  - Shows answer status

- `POST /question/:id` - Answer question (requires authentication)
  - Only auction creator can answer
  - Returns 403 if not the creator

#### Search
- `GET /search` - Search and filter items
  - **Query string**: `?q=search_term`
  - **Pagination**: `limit` and `offset` parameters
  - **Status filters** (require authentication):
    - `status=OPEN` - User's active listings
    - `status=BID` - Items user is bidding on
    - `status=ARCHIVE` - User's ended auctions
  - **Category filter**: `?category=:id`
  - **Combined filters**: Can combine query + status or query + category

## 🎯 Extension Tasks Completed (10% of Grade)

### Extension Task 1: Profanity Filter ✓ (Easy)
- **Package**: leo-profanity (CommonJS compatible)
- **Applied to**:
  - Item names
  - Item descriptions
  - Question text
- **Implementation**: Automatic sanitization with `***` replacement
- **Location**: `app/utils/profanity.utils.js`

### Extension Task 2: Categories System ✓ (Hard)
- **Database tables**:
  - `categories` - Stores category names (category_id, name)
  - `item_categories` - Junction table for many-to-many relationship
- **Default categories**: Rock, Jazz, Classical, Blues, Pop, Electronic, Hip Hop, Country
- **Endpoints**:
  - `GET /categories` - Returns all categories
  - `POST /item` - Accepts optional `categories` array
  - `GET /search?category=:id` - Filter items by category
- **Features**:
  - Multiple categories per item
  - Validates category IDs exist
  - Automatic association on item creation

### Extension Task 3: Frontend Local Drafts ⏳ (Pending - Frontend)
- To be implemented in frontend using localStorage
- Features planned: save, view, edit, delete drafts

## 🏗️ Architecture

### Directory Structure
```
app/
├── controllers/      # Request handling and response formatting
│   ├── user.controller.js
│   ├── item.controller.js
│   ├── bid.controller.js
│   ├── question.controller.js
│   └── category.controller.js
├── models/          # Database operations and business logic
│   ├── user.model.js
│   ├── item.model.js
│   ├── bid.model.js
│   ├── question.model.js
│   └── category.model.js
├── routes/          # API route definitions
│   ├── user.server.routes.js
│   ├── core.server.routes.js
│   ├── question.server.routes.js
│   └── category.server.routes.js
├── middleware/      # Authentication middleware
│   └── auth.middleware.js
└── utils/           # Utility functions
    ├── auth.utils.js        # Password hashing, token generation
    ├── validation.utils.js  # Joi schemas for request validation
    └── profanity.utils.js   # Profanity filtering
```

### Database Schema
```sql
users (user_id, first_name, last_name, email UNIQUE, password, salt, session_token)
items (item_id, name, description, starting_bid, start_date, end_date, creator_id FK)
bids (item_id FK, user_id FK, amount, timestamp) - Composite PK
questions (question_id, question, answer, asked_by FK, item_id FK)
categories (category_id, name UNIQUE)
item_categories (item_id FK, category_id FK) - Composite PK
```

## 🔒 Security Features

- **Password Security**:
  - PBKDF2 hashing with 100,000 iterations
  - Random 64-byte salt per user
  - SHA-512 algorithm

- **Session Management**:
  - Cryptographically random 32-byte tokens
  - Stored hashed in database
  - Passed via `X-Authorization` header

- **Input Validation**:
  - Joi schema validation on all endpoints
  - No unknown fields allowed
  - Type checking and constraint validation
  - Profanity filtering on user content

## 📊 Test Results

**All 128 automated tests passing:**
- 26 User creation tests
- 9 Authentication tests
- 31 Auction creation tests
- 12 Bidding tests
- 5 Bid history tests
- 3 Item details tests
- 3 User profile tests
- 18 Questions tests
- 21 Search tests

## 🚀 Running the Backend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on http://localhost:3333

# Run tests (in separate terminal)
npm test

# Wipe database
npm run wipe
```

## 📝 API Testing

The backend can be tested using:
- **Automated tests**: `npm test`
- **Postman/Insomnia**: Import endpoints from Swagger
- **Swagger UI**: https://app.swaggerhub.com/apis/MMU-SE/Auctionary/1.0.0

## 🎨 Frontend TODO

To complete the assignment to 100%, the following frontend work is required:

### 1. Vue 3 Setup
```bash
npm create vue@latest auctionary-frontend
cd auctionary-frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Theme Configuration (Blue/White - Vintage Vinyl)
- **Font**: Poppins (Google Fonts)
- **Colors**: Professional blue (#3b82f6) and white
- **Base font size**: 0.875rem
- **Style**: Crisp, high-end vinyl record aesthetic

### 3. Required Pages
- `/login` - Login form
- `/register` - User registration
- `/auctions` - Browse auctions (with search, filters, categories)
- `/auctions/:id` - Auction detail with bid form and questions
- `/create` - Create new auction (with drafts support)
- `/my-auctions` - User's items (selling, bidding, ended)

### 4. Components Needed
- Header with navigation and auth state
- AuctionCard for listing view
- BidForm for placing bids
- QuestionList and QuestionForm
- CategoryFilter dropdown
- DraftManager (Extension Task 3)

### 5. API Integration
- Axios/Fetch for HTTP requests
- Base URL: http://localhost:3333
- Token management (localStorage)
- Error handling with user feedback

### 6. Extension Task 3: Local Drafts
- Save incomplete auction forms to localStorage
- List, edit, and delete drafts
- Load draft into form
- Auto-save on form changes

## 📦 Submission Checklist

### Backend ✓
- [x] All endpoints implemented
- [x] All tests passing (128/128)
- [x] Profanity filter working
- [x] Categories system complete
- [x] Code committed and pushed

### Frontend (Pending)
- [ ] Vue 3 app created
- [ ] Authentication pages
- [ ] Auction listing and details
- [ ] Bidding functionality
- [ ] Questions functionality
- [ ] Local drafts system
- [ ] Professional Vintage Vinyl theme
- [ ] Responsive design

### Final Submission
- [ ] Backend code (excluding node_modules)
- [ ] Frontend code (excluding node_modules)
- [ ] 5-minute screencast demonstration
- [ ] All functionality working end-to-end

## 📈 Estimated Grade Breakdown

Based on current implementation:

| Component | Possible | Completed | Notes |
|-----------|----------|-----------|-------|
| Backend Functionality | 45% | 45% | All tests passing, all endpoints working |
| Frontend Functionality | 30% | 0% | Not yet implemented |
| Frontend UX/Design | 15% | 0% | Pending frontend |
| Extension Tasks | 10% | 7% | Task 1 & 2 done, Task 3 pending frontend |
| **Total** | **100%** | **52%** | **Backend complete, frontend needed** |

To achieve 70% (First Class): Complete frontend authentication, basic auction CRUD, and bidding
To achieve 85%: Add all frontend features, proper UX, and Extension Task 3
To achieve 90%+: Exceptional design, all features, perfect test coverage

## 🔗 Repository
- **Branch**: `claude/review-assessment-template-01SxvcgiGnNLJs5uvKyYHMSD`
- **Backend commit**: `7f62ad2` - "Implement complete Auctionary backend API with all endpoints and extensions"

## 📞 Support
For issues or questions about the backend implementation, review the code in `/app` directory or run `npm test` to verify all functionality.
