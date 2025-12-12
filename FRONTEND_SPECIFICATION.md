# Auctionary Frontend Specification Document
## Complete Requirements & Implementation Guide

**Course**: Full Stack Web Development (6G5Z0038) 2025/26
**Document Version**: 1.0
**Last Updated**: December 2025

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Backend API Reference](#backend-api-reference)
3. [Frontend Architecture Requirements](#frontend-architecture-requirements)
4. [Page-by-Page Specifications](#page-by-page-specifications)
5. [Component Specifications](#component-specifications)
6. [State Management Requirements](#state-management-requirements)
7. [Validation & Error Handling](#validation--error-handling)
8. [Extension Tasks Frontend Requirements](#extension-tasks-frontend-requirements)
9. [Design Specifications](#design-specifications)
10. [User Experience Requirements](#user-experience-requirements)
11. [Implementation Checklist](#implementation-checklist)

---

## 1. Project Overview

### Purpose
Build a complete Vue 3 frontend application for the Auctionary online auction platform that consumes the RESTful API backend built with Node.js/Express/SQLite.

### Technology Stack (Required)
- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS (or alternative CSS framework)
- **Font**: Professional web font (e.g., Poppins, Inter, Roboto)

### Theme Requirements
- **Platform Name**: Vintage Vinyl Auctions (or your chosen theme)
- **Color Scheme**: Professional, consistent palette (primary, secondary, neutral colors)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Style**: Modern, crisp, high-end aesthetic

---

## 2. Backend API Reference

### Base URL
```
http://localhost:3333
```

### Authentication
- **Method**: Token-based authentication
- **Header**: `X-Authorization: <session_token>`
- **Token Source**: Returned from `/login` and `/users` endpoints
- **Storage**: Store in localStorage

### API Endpoints

#### 2.1 User Endpoints

##### POST `/users` - Register New User
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `first_name`: Required, min 1 character, trimmed
- `last_name`: Required, min 1 character, trimmed
- `email`: Required, valid email format, trimmed
- `password`: Required, 8-40 characters, must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

**Success Response (201):**
```json
{
  "user_id": 1,
  "session_token": "a1b2c3d4e5f6..."
}
```

**Error Responses:**
- `400`: Validation error (email already exists, invalid password, etc.)

##### POST `/login` - User Login
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "user_id": 1,
  "session_token": "a1b2c3d4e5f6..."
}
```

**Error Responses:**
- `400`: Invalid credentials

##### POST `/logout` - User Logout
**Headers Required:**
```
X-Authorization: <session_token>
```

**Success Response (200):**
```json
{}
```

**Error Responses:**
- `401`: Unauthorized (invalid or missing token)

##### GET `/users/:id` - Get User Details
**Success Response (200):**
```json
{
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Error Responses:**
- `404`: User not found

#### 2.2 Item (Auction) Endpoints

##### POST `/item` - Create Auction Item
**Headers Required:**
```
X-Authorization: <session_token>
```

**Request Body:**
```json
{
  "name": "The Beatles - Abbey Road Vinyl",
  "description": "Original 1969 pressing in excellent condition",
  "starting_bid": 50.00,
  "end_date": 1735689600000,
  "categories": [1, 2]
}
```

**Validation Rules:**
- `name`: Required, min 1 character, trimmed
- `description`: Required, min 1 character, trimmed
- `starting_bid`: Required, number, min 0
- `end_date`: Required, Unix timestamp (milliseconds), must be in future
- `categories`: Optional, array of category IDs (integers)

**Success Response (201):**
```json
{
  "item_id": 1
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Unauthorized

##### GET `/item/:id` - Get Item Details
**Success Response (200):**
```json
{
  "item_id": 1,
  "name": "The Beatles - Abbey Road Vinyl",
  "description": "Original 1969 pressing in excellent condition",
  "starting_bid": 50.00,
  "current_bid": 75.00,
  "end_date": 1735689600000,
  "creator_id": 2,
  "creator_first_name": "Jane",
  "creator_last_name": "Smith",
  "creator_email": "jane@example.com",
  "categories": [
    { "category_id": 1, "name": "Rock" },
    { "category_id": 2, "name": "Classic" }
  ]
}
```

**Error Responses:**
- `404`: Item not found

##### GET `/search` - Search Items
**Query Parameters:**
- `q`: Search query string (searches name and description)
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)
- `category`: Filter by category ID
- `status`: Filter by user status (requires authentication)
  - `OPEN`: Items created by authenticated user
  - `BID`: Items where authenticated user has placed bids
  - `ARCHIVE`: Closed items created by or bid on by authenticated user

**Example Requests:**
```
GET /search?q=vinyl&limit=20
GET /search?category=1
GET /search?status=OPEN&q=beatles (requires auth)
```

**Success Response (200):**
```json
[
  {
    "item_id": 1,
    "name": "The Beatles - Abbey Road Vinyl",
    "description": "Original 1969 pressing...",
    "starting_bid": 50.00,
    "current_bid": 75.00,
    "end_date": 1735689600000,
    "creator_id": 2,
    "creator_first_name": "Jane",
    "creator_last_name": "Smith"
  }
]
```

**Error Responses:**
- `400`: Invalid status value or authentication required for status filters

#### 2.3 Bid Endpoints

##### POST `/item/:id/bid` - Place Bid
**Headers Required:**
```
X-Authorization: <session_token>
```

**Request Body:**
```json
{
  "amount": 100.00
}
```

**Validation Rules:**
- `amount`: Required, positive number
- Must be higher than current bid (or starting bid if no bids)
- Cannot bid on own item
- Cannot bid on closed auction

**Success Response (200):**
```json
{}
```

**Error Responses:**
- `400`: Validation error (bid too low, auction closed, etc.)
- `401`: Unauthorized
- `403`: Cannot bid on own item

##### GET `/item/:id/bid` - Get Bid History
**Success Response (200):**
```json
[
  {
    "bid_id": 1,
    "amount": 100.00,
    "timestamp": 1735689500000,
    "bidder_id": 3,
    "bidder_first_name": "Bob",
    "bidder_last_name": "Johnson"
  },
  {
    "bid_id": 2,
    "amount": 75.00,
    "timestamp": 1735689400000,
    "bidder_id": 4,
    "bidder_first_name": "Alice",
    "bidder_last_name": "Williams"
  }
]
```

#### 2.4 Question Endpoints

##### POST `/item/:id/question` - Ask Question
**Headers Required:**
```
X-Authorization: <session_token>
```

**Request Body:**
```json
{
  "question_text": "Is this the original UK pressing?"
}
```

**Validation Rules:**
- `question_text`: Required, min 1 character, trimmed

**Success Response (201):**
```json
{
  "question_id": 1
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Unauthorized
- `404`: Item not found

##### GET `/item/:id/question` - Get Questions for Item
**Success Response (200):**
```json
[
  {
    "question_id": 1,
    "question_text": "Is this the original UK pressing?",
    "answer_text": "Yes, it is the original 1969 UK pressing.",
    "asker_id": 5,
    "asker_first_name": "Charlie",
    "asker_last_name": "Brown",
    "timestamp": 1735689300000
  }
]
```

##### POST `/question/:id` - Answer Question
**Headers Required:**
```
X-Authorization: <session_token>
```

**Request Body:**
```json
{
  "answer_text": "Yes, it is the original 1969 UK pressing."
}
```

**Validation Rules:**
- `answer_text`: Required, min 1 character, trimmed
- Only item creator can answer questions
- Cannot answer already answered questions

**Success Response (200):**
```json
{}
```

**Error Responses:**
- `400`: Validation error or question already answered
- `401`: Unauthorized
- `403`: Only item creator can answer
- `404`: Question not found

#### 2.5 Category Endpoints

##### GET `/categories` - Get All Categories
**Success Response (200):**
```json
[
  { "category_id": 1, "name": "Rock" },
  { "category_id": 2, "name": "Jazz" },
  { "category_id": 3, "name": "Classical" },
  { "category_id": 4, "name": "Blues" },
  { "category_id": 5, "name": "Pop" },
  { "category_id": 6, "name": "Electronic" },
  { "category_id": 7, "name": "Hip Hop" },
  { "category_id": 8, "name": "Country" }
]
```

---

## 3. Frontend Architecture Requirements

### 3.1 Project Structure
```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── main.css              # Global styles, Tailwind imports
│   ├── components/
│   │   ├── AppHeader.vue         # Navigation header
│   │   ├── AuctionCard.vue       # Reusable auction item card
│   │   ├── SearchBar.vue         # Search with filters
│   │   ├── CategoryFilter.vue    # Category selection
│   │   ├── BidHistory.vue        # Bid history display
│   │   ├── QuestionList.vue      # Q&A section
│   │   └── LoadingSpinner.vue    # Loading indicator
│   ├── views/
│   │   ├── HomeView.vue          # Landing/browse auctions
│   │   ├── LoginView.vue         # User login
│   │   ├── RegisterView.vue      # User registration
│   │   ├── AuctionDetailView.vue # Single auction details
│   │   ├── CreateAuctionView.vue # Create new auction
│   │   └── MyAuctionsView.vue    # User dashboard
│   ├── stores/
│   │   ├── auth.js               # Authentication state
│   │   ├── auctions.js           # Auction data
│   │   └── drafts.js             # Draft management (Extension Task 3)
│   ├── services/
│   │   └── api.js                # Axios instance & API calls
│   ├── router/
│   │   └── index.js              # Vue Router config
│   ├── utils/
│   │   ├── validation.js         # Form validation helpers
│   │   └── formatters.js         # Date/currency formatters
│   ├── App.vue                   # Root component
│   └── main.js                   # Application entry
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

### 3.2 Required NPM Packages
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### 3.3 API Service Layer (`src/services/api.js`)

**Required Structure:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers['X-Authorization'] = token;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect to login
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export API functions
export default {
  // User APIs
  register: (userData) => api.post('/users', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getUser: (userId) => api.get(`/users/${userId}`),

  // Item APIs
  createItem: (itemData) => api.post('/item', itemData),
  getItem: (itemId) => api.get(`/item/${itemId}`),
  searchItems: (params) => api.get('/search', { params }),

  // Bid APIs
  placeBid: (itemId, amount) => api.post(`/item/${itemId}/bid`, { amount }),
  getBidHistory: (itemId) => api.get(`/item/${itemId}/bid`),

  // Question APIs
  askQuestion: (itemId, questionText) =>
    api.post(`/item/${itemId}/question`, { question_text: questionText }),
  getQuestions: (itemId) => api.get(`/item/${itemId}/question`),
  answerQuestion: (questionId, answerText) =>
    api.post(`/question/${questionId}`, { answer_text: answerText }),

  // Category APIs
  getCategories: () => api.get('/categories')
};
```

---

## 4. Page-by-Page Specifications

### 4.1 HomeView.vue - Browse Auctions

**Purpose**: Main landing page showing all active auctions with search and filter capabilities.

**Required Features:**
1. **Search Bar**
   - Text input for keyword search (searches name and description)
   - Search button to trigger search
   - Clear button to reset search

2. **Category Filter**
   - Dropdown or checkbox list of all categories
   - "All Categories" option to show unfiltered results
   - Visual indicator of selected category

3. **Auction Grid/List**
   - Display all auction items as cards
   - Show: name, current bid, time remaining, thumbnail (optional)
   - Click on card navigates to auction detail page
   - Responsive grid (3-4 columns on desktop, 1-2 on mobile)

4. **Pagination**
   - Load more button OR pagination controls
   - Default: 10 items per page
   - Show total results count

5. **Empty State**
   - Message when no auctions found
   - Suggestion to adjust filters or create new auction

**Data Requirements:**
- Fetch auctions on mount: `GET /search?limit=10&offset=0`
- Update on search: `GET /search?q=<query>&category=<id>&limit=10&offset=0`
- Auto-refresh every 30 seconds (optional but recommended)

**UI Elements:**
```
┌────────────────────────────────────────┐
│  Header (Logo, Search, Nav)            │
├────────────────────────────────────────┤
│  [Search: _____________] [Categories ▾]│
│                                         │
│  ┌───────┐ ┌───────┐ ┌───────┐        │
│  │ Card  │ │ Card  │ │ Card  │        │
│  │ $50   │ │ $75   │ │ $100  │        │
│  │ 2h    │ │ 1d    │ │ 5h    │        │
│  └───────┘ └───────┘ └───────┘        │
│                                         │
│  [Load More]                            │
└────────────────────────────────────────┘
```

**User Flows:**
1. User lands on page → See all active auctions
2. User types "vinyl" in search → Results filtered to matching items
3. User selects "Rock" category → Results filtered to Rock items
4. User clicks auction card → Navigate to detail page

---

### 4.2 LoginView.vue - User Login

**Purpose**: Authenticate existing users.

**Required Features:**
1. **Login Form**
   - Email input (type="email")
   - Password input (type="password", show/hide toggle recommended)
   - "Remember me" checkbox (optional)
   - Submit button

2. **Validation**
   - Client-side: Required fields, valid email format
   - Display backend error messages
   - Disable submit during API call

3. **Success Behavior**
   - Store `session_token` and `user_id` in localStorage
   - Update Pinia auth store
   - Redirect to home page or previous page

4. **Links**
   - "Don't have an account? Register" link to RegisterView

**API Call:**
```javascript
async handleLogin() {
  try {
    const response = await api.login({
      email: this.email,
      password: this.password
    });

    // Store auth data
    localStorage.setItem('session_token', response.data.session_token);
    localStorage.setItem('user_id', response.data.user_id);

    // Update store
    authStore.login(response.data);

    // Redirect
    router.push('/');
  } catch (error) {
    this.errorMessage = error.response?.data?.error_message || 'Login failed';
  }
}
```

**UI Elements:**
```
┌───────────────────────┐
│  Login to Auctionary  │
│                       │
│  Email:               │
│  [_________________]  │
│                       │
│  Password:            │
│  [_________________]  │
│                       │
│  [Login Button]       │
│                       │
│  Don't have account?  │
│  Register             │
└───────────────────────┘
```

---

### 4.3 RegisterView.vue - User Registration

**Purpose**: Create new user accounts.

**Required Features:**
1. **Registration Form**
   - First name input
   - Last name input
   - Email input (type="email")
   - Password input (type="password")
   - Confirm password input
   - Submit button

2. **Password Validation (Client-Side)**
   - Display requirements before user types:
     - 8-40 characters
     - At least 1 uppercase letter
     - At least 1 lowercase letter
     - At least 1 number
     - At least 1 special character
   - Visual indicators (✓/✗) for each requirement
   - Real-time validation as user types
   - Passwords must match

3. **Error Handling**
   - Show backend errors (e.g., "Email already exists")
   - Highlight invalid fields
   - Disable submit if validation fails

4. **Success Behavior**
   - Store `session_token` and `user_id` in localStorage
   - Redirect to home page
   - Show welcome message (optional)

**Password Validation Logic:**
```javascript
const passwordRequirements = computed(() => ({
  length: password.value.length >= 8 && password.value.length <= 40,
  uppercase: /[A-Z]/.test(password.value),
  lowercase: /[a-z]/.test(password.value),
  number: /[0-9]/.test(password.value),
  special: /[^A-Za-z0-9]/.test(password.value)
}));

const isPasswordValid = computed(() =>
  Object.values(passwordRequirements.value).every(v => v === true)
);

const passwordsMatch = computed(() =>
  password.value === confirmPassword.value && password.value !== ''
);
```

**UI Elements:**
```
┌──────────────────────────┐
│  Create Account          │
│                          │
│  First Name:             │
│  [____________________]  │
│                          │
│  Last Name:              │
│  [____________________]  │
│                          │
│  Email:                  │
│  [____________________]  │
│                          │
│  Password:               │
│  [____________________]  │
│                          │
│  Requirements:           │
│  ✓ 8-40 characters       │
│  ✓ Uppercase letter      │
│  ✗ Lowercase letter      │
│  ✓ Number                │
│  ✗ Special character     │
│                          │
│  Confirm Password:       │
│  [____________________]  │
│                          │
│  [Register Button]       │
│                          │
│  Already have account?   │
│  Login                   │
└──────────────────────────┘
```

---

### 4.4 AuctionDetailView.vue - Single Auction Details

**Purpose**: Display full details of a single auction with bidding and Q&A functionality.

**Required Features:**

1. **Item Information Display**
   - Item name (large heading)
   - Full description
   - Starting bid
   - Current bid (if any bids exist)
   - End date/time with countdown timer
   - Status indicator (Active/Closed)
   - Categories (as badges/tags)
   - Seller information (name, not email)

2. **Bidding Section** (if user is authenticated and not the seller)
   - Current highest bid display
   - Bid input field
   - "Place Bid" button
   - Validation:
     - Must be higher than current bid
     - Show minimum required bid
   - Success/error feedback
   - Disable if auction closed

3. **Bid History**
   - List all bids for this item
   - Show: amount, bidder name, timestamp
   - Sort: highest to lowest (most recent first)
   - Show "No bids yet" if empty

4. **Questions & Answers Section**
   - Display all questions for this item
   - Show: question text, asker name, answer (if answered), timestamp
   - "Ask a Question" form (if authenticated and not seller)
   - "Answer" button on each unanswered question (if user is seller)
   - Answer form appears inline when clicked

5. **Conditional Rendering**
   - If user is seller:
     - Cannot bid
     - Can answer questions
     - Show "Your Auction" indicator
   - If user is not authenticated:
     - Show "Login to bid" message
     - Show "Login to ask questions" message
   - If auction is closed:
     - Disable bidding
     - Disable question asking
     - Show "Auction Ended" message

**Data Fetching:**
```javascript
onMounted(async () => {
  try {
    // Fetch item details
    const itemResponse = await api.getItem(route.params.id);
    item.value = itemResponse.data;

    // Fetch bid history
    const bidsResponse = await api.getBidHistory(route.params.id);
    bids.value = bidsResponse.data;

    // Fetch questions
    const questionsResponse = await api.getQuestions(route.params.id);
    questions.value = questionsResponse.data;
  } catch (error) {
    errorMessage.value = 'Failed to load auction details';
  }
});
```

**Bidding Logic:**
```javascript
const minBid = computed(() => {
  if (item.value.current_bid) {
    return item.value.current_bid + 0.01;
  }
  return item.value.starting_bid;
});

async function placeBid() {
  if (bidAmount.value < minBid.value) {
    errorMessage.value = `Bid must be at least $${minBid.value}`;
    return;
  }

  try {
    await api.placeBid(item.value.item_id, bidAmount.value);
    successMessage.value = 'Bid placed successfully!';
    // Refresh item and bid history
    await fetchItemDetails();
  } catch (error) {
    errorMessage.value = error.response?.data?.error_message || 'Bid failed';
  }
}
```

**UI Elements:**
```
┌────────────────────────────────────────────┐
│  ← Back                                     │
│                                             │
│  The Beatles - Abbey Road Vinyl             │
│  [Rock] [Classic]                           │
│                                             │
│  Seller: Jane Smith                         │
│  Starting Bid: $50.00                       │
│  Current Bid: $75.00                        │
│  Ends: Dec 25, 2025 (2 days remaining)      │
│                                             │
│  Description:                               │
│  Original 1969 pressing in excellent        │
│  condition. Minor wear on sleeve...         │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │  Place Your Bid                  │       │
│  │  Minimum: $75.01                 │       │
│  │  Amount: [_______]               │       │
│  │  [Place Bid]                     │       │
│  └─────────────────────────────────┘       │
│                                             │
│  Bid History:                               │
│  • $75.00 - Bob Johnson (1 hour ago)        │
│  • $60.00 - Alice Williams (3 hours ago)    │
│                                             │
│  Questions & Answers:                       │
│  Q: Is this the original UK pressing?       │
│     - Charlie Brown (2 days ago)            │
│  A: Yes, it is the original 1969 UK         │
│     pressing.                               │
│                                             │
│  [Ask a Question]                           │
└────────────────────────────────────────────┘
```

---

### 4.5 CreateAuctionView.vue - Create New Auction

**Purpose**: Allow authenticated users to create new auction listings.

**Required Features:**

1. **Auction Form**
   - Item name input
   - Description textarea (multiline)
   - Starting bid input (number, min 0)
   - End date/time picker
   - Category selection (multiple checkboxes or multi-select)
   - Submit button

2. **Validation (Client-Side)**
   - All fields required except categories
   - Name: Min 1 character
   - Description: Min 1 character
   - Starting bid: Must be ≥ 0
   - End date: Must be in the future
   - Show validation errors inline

3. **Date/Time Handling**
   - Use `<input type="datetime-local">` OR date picker library
   - Convert to Unix timestamp (milliseconds) before sending to API
   - Default to 7 days from now (suggested)

4. **Category Selection**
   - Fetch all categories on mount
   - Display as checkboxes or multi-select dropdown
   - Allow 0-N selections
   - Show selected count

5. **Success Behavior**
   - Show success message
   - Redirect to created auction detail page
   - Clear form (if staying on page)

6. **Extension Task 3: Draft Management**
   - Auto-save form data to localStorage every 1-2 seconds
   - "Save Draft" button for manual save
   - "Load Draft" dropdown to restore saved drafts
   - "Delete Draft" option
   - Show last saved timestamp
   - Draft data structure:
     ```javascript
     {
       id: timestamp,
       name: '',
       description: '',
       starting_bid: 0,
       end_date: null,
       categories: [],
       createdAt: timestamp,
       updatedAt: timestamp
     }
     ```

**API Call:**
```javascript
async function createAuction() {
  const endDateTimestamp = new Date(endDate.value).getTime();

  try {
    const response = await api.createItem({
      name: name.value,
      description: description.value,
      starting_bid: parseFloat(startingBid.value),
      end_date: endDateTimestamp,
      categories: selectedCategories.value
    });

    // Clear draft if using Extension Task 3
    draftsStore.deleteDraft(currentDraftId.value);

    // Redirect to created auction
    router.push(`/auction/${response.data.item_id}`);
  } catch (error) {
    errorMessage.value = error.response?.data?.error_message || 'Failed to create auction';
  }
}
```

**UI Elements:**
```
┌────────────────────────────────────────┐
│  Create New Auction                     │
│                                         │
│  [Load Draft ▾] [Save Draft]           │
│  Last saved: 2 minutes ago              │
│                                         │
│  Item Name:                             │
│  [_______________________________]     │
│                                         │
│  Description:                           │
│  [_______________________________]     │
│  [_______________________________]     │
│  [_______________________________]     │
│                                         │
│  Starting Bid ($):                      │
│  [_______]                              │
│                                         │
│  End Date & Time:                       │
│  [_______________________]              │
│                                         │
│  Categories:                            │
│  ☑ Rock      ☐ Jazz                    │
│  ☐ Classical ☐ Blues                   │
│  ☐ Pop       ☐ Electronic              │
│                                         │
│  [Create Auction]                       │
└────────────────────────────────────────┘
```

---

### 4.6 MyAuctionsView.vue - User Dashboard

**Purpose**: Show authenticated user's auction activity (selling, bidding, archive).

**Required Features:**

1. **Three Tabs/Sections**
   - **Selling**: Auctions created by user (status=OPEN)
   - **Bidding**: Auctions user has bid on (status=BID)
   - **Archive**: Closed auctions user created or bid on (status=ARCHIVE)

2. **Each Tab Displays:**
   - List of auction items (use AuctionCard component)
   - Search within tab (optional)
   - Empty state message if no items

3. **Data Fetching:**
   ```javascript
   // Selling tab
   api.searchItems({ status: 'OPEN', limit: 50 })

   // Bidding tab
   api.searchItems({ status: 'BID', limit: 50 })

   // Archive tab
   api.searchItems({ status: 'ARCHIVE', limit: 50 })
   ```

4. **Authentication Guard**
   - Redirect to login if not authenticated
   - Use Vue Router navigation guard

5. **Additional Info (per item)**
   - For selling: Show number of bids, current bid
   - For bidding: Show your highest bid, current winning bid
   - For archive: Show final price, winner (if you sold it)

**UI Elements:**
```
┌────────────────────────────────────────┐
│  My Auctions                            │
│                                         │
│  [Selling] [Bidding] [Archive]         │
│  ────────                               │
│                                         │
│  ┌───────────────────────────┐         │
│  │ The Beatles - Abbey Road  │         │
│  │ Current Bid: $75.00       │         │
│  │ 5 bids • Ends in 2 days   │         │
│  └───────────────────────────┘         │
│                                         │
│  ┌───────────────────────────┐         │
│  │ Led Zeppelin IV           │         │
│  │ Current Bid: $100.00      │         │
│  │ 8 bids • Ends in 5 hours  │         │
│  └───────────────────────────┘         │
│                                         │
└────────────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 AppHeader.vue - Navigation Header

**Required Features:**
- Logo/site name (links to home)
- Navigation links:
  - Home/Browse
  - Create Auction (if authenticated)
  - My Auctions (if authenticated)
- User menu (if authenticated):
  - Display user name
  - Logout button
- Login/Register buttons (if not authenticated)
- Responsive: Collapse to hamburger menu on mobile

**Conditional Rendering:**
```vue
<template>
  <header>
    <div class="logo">Vintage Vinyl Auctions</div>
    <nav>
      <RouterLink to="/">Browse</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/create">
        Create Auction
      </RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/my-auctions">
        My Auctions
      </RouterLink>
    </nav>
    <div v-if="authStore.isAuthenticated" class="user-menu">
      <span>{{ userName }}</span>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else class="auth-links">
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register">Register</RouterLink>
    </div>
  </header>
</template>
```

---

### 5.2 AuctionCard.vue - Reusable Item Card

**Props:**
```javascript
defineProps({
  item: {
    type: Object,
    required: true
    // Expected: { item_id, name, current_bid, starting_bid, end_date, ... }
  }
})
```

**Display:**
- Item name
- Current bid (or starting bid if no bids)
- Time remaining (calculated from end_date)
- Categories (optional)
- Click card → Navigate to `/auction/${item.item_id}`

**Time Remaining Logic:**
```javascript
const timeRemaining = computed(() => {
  const now = Date.now();
  const end = props.item.end_date;
  const diff = end - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return '< 1h';
});
```

---

### 5.3 SearchBar.vue - Search Input with Filters

**Features:**
- Text input for search query
- Category dropdown
- Search button
- Clear filters button

**Emits:**
```javascript
const emit = defineEmits(['search', 'clear']);

function handleSearch() {
  emit('search', {
    query: searchQuery.value,
    category: selectedCategory.value
  });
}
```

---

## 6. State Management Requirements

### 6.1 Auth Store (`stores/auth.js`)

**State:**
```javascript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('session_token') || null,
    userId: localStorage.getItem('user_id') || null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      const response = await api.login(credentials);
      this.token = response.data.session_token;
      this.userId = response.data.user_id;
      localStorage.setItem('session_token', this.token);
      localStorage.setItem('user_id', this.userId);
    },

    async register(userData) {
      const response = await api.register(userData);
      this.token = response.data.session_token;
      this.userId = response.data.user_id;
      localStorage.setItem('session_token', this.token);
      localStorage.setItem('user_id', this.userId);
    },

    async logout() {
      try {
        await api.logout();
      } finally {
        this.token = null;
        this.userId = null;
        this.user = null;
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_id');
      }
    },

    async fetchUser() {
      if (this.userId) {
        const response = await api.getUser(this.userId);
        this.user = response.data;
      }
    }
  }
});
```

---

### 6.2 Drafts Store (`stores/drafts.js`) - Extension Task 3

**State:**
```javascript
export const useDraftsStore = defineStore('drafts', {
  state: () => ({
    drafts: JSON.parse(localStorage.getItem('auction_drafts') || '[]')
  }),

  actions: {
    saveDraft(draft) {
      const index = this.drafts.findIndex(d => d.id === draft.id);
      const timestamp = Date.now();

      if (index > -1) {
        this.drafts[index] = { ...draft, updatedAt: timestamp };
      } else {
        this.drafts.push({
          ...draft,
          id: draft.id || timestamp,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      this.persistDrafts();
      return this.drafts[this.drafts.length - 1];
    },

    loadDraft(id) {
      return this.drafts.find(d => d.id === id);
    },

    deleteDraft(id) {
      this.drafts = this.drafts.filter(d => d.id !== id);
      this.persistDrafts();
    },

    persistDrafts() {
      localStorage.setItem('auction_drafts', JSON.stringify(this.drafts));
    }
  }
});
```

---

## 7. Validation & Error Handling

### 7.1 Form Validation Rules

**Password Validation:**
```javascript
function validatePassword(password) {
  const rules = {
    length: password.length >= 8 && password.length <= 40,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const errors = [];
  if (!rules.length) errors.push('Must be 8-40 characters');
  if (!rules.uppercase) errors.push('Must contain uppercase letter');
  if (!rules.lowercase) errors.push('Must contain lowercase letter');
  if (!rules.number) errors.push('Must contain number');
  if (!rules.special) errors.push('Must contain special character');

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Email Validation:**
```javascript
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

**Bid Validation:**
```javascript
function validateBid(amount, minBid) {
  if (amount <= 0) return { valid: false, error: 'Bid must be positive' };
  if (amount < minBid) return { valid: false, error: `Bid must be at least $${minBid}` };
  return { valid: true };
}
```

### 7.2 Error Display Patterns

**Inline Field Errors:**
```vue
<div class="form-field">
  <label>Email</label>
  <input v-model="email" :class="{ 'error': emailError }" />
  <span v-if="emailError" class="error-message">{{ emailError }}</span>
</div>
```

**Global Error Messages:**
```vue
<div v-if="errorMessage" class="alert alert-error">
  {{ errorMessage }}
</div>
```

**Success Messages:**
```vue
<div v-if="successMessage" class="alert alert-success">
  {{ successMessage }}
</div>
```

---

## 8. Extension Tasks Frontend Requirements

### Extension Task 1: Profanity Filter
**Frontend Impact:** None required (handled by backend)
- Backend automatically filters profanity in item names, descriptions, questions, and answers
- Frontend displays filtered text (with asterisks)

### Extension Task 2: Categories
**Frontend Requirements:**
1. **Fetch categories** on app initialization
2. **Display categories** in:
   - Search filters (dropdown/checkboxes)
   - Item detail page (as badges/tags)
   - Create auction form (multi-select)
3. **Filter by category** in search

**Category Display Component:**
```vue
<template>
  <div class="categories">
    <span v-for="cat in categories" :key="cat.category_id" class="category-badge">
      {{ cat.name }}
    </span>
  </div>
</template>
```

### Extension Task 3: Local Drafts
**Frontend Requirements:**
1. **Auto-save** form data in CreateAuctionView
   - Debounce: Save 1-2 seconds after user stops typing
   - Use `useDraftsStore`
2. **Save Draft button** for manual save
3. **Load Draft dropdown** to restore saved drafts
4. **Delete Draft** button
5. **Show last saved timestamp**
6. **Clear draft** on successful auction creation

**Auto-save Implementation:**
```javascript
import { useDebounceFn } from '@vueuse/core'; // Or implement manually

const autoSave = useDebounceFn(() => {
  draftsStore.saveDraft({
    id: currentDraftId.value,
    name: name.value,
    description: description.value,
    starting_bid: startingBid.value,
    end_date: endDate.value,
    categories: selectedCategories.value
  });
}, 1000);

watch([name, description, startingBid, endDate, selectedCategories], () => {
  if (name.value || description.value) {
    autoSave();
  }
});
```

---

## 9. Design Specifications

### 9.1 Color Palette

**Example (Vintage Vinyl Theme):**
```css
:root {
  --primary: #3b82f6;        /* Blue */
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;

  --secondary: #8b5cf6;      /* Purple */
  --accent: #f59e0b;         /* Amber */

  --text: #1f2937;           /* Dark gray */
  --text-light: #6b7280;     /* Medium gray */
  --background: #ffffff;
  --background-alt: #f9fafb; /* Light gray */

  --border: #e5e7eb;
  --error: #ef4444;
  --success: #10b981;
}
```

### 9.2 Typography

**Font Families:**
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
}

h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 500; }
```

### 9.3 Component Styles

**Buttons:**
```css
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}
```

**Cards:**
```css
.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Forms:**
```css
.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--error);
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

### 9.4 Responsive Breakpoints

```css
/* Mobile first approach */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }

  .auction-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .auction-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 10. User Experience Requirements

### 10.1 Loading States

**Show loading indicators during:**
- Initial page load (fetching data)
- Form submissions
- Search operations

**Implementation:**
```vue
<template>
  <div v-if="loading" class="loading-spinner">
    Loading...
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### 10.2 Empty States

**Show helpful messages when:**
- No search results found
- No auctions in "My Auctions" tabs
- No bids on an item
- No questions on an item

**Example:**
```vue
<div v-if="items.length === 0" class="empty-state">
  <p>No auctions found. Try adjusting your filters or create a new auction!</p>
  <RouterLink to="/create" class="btn btn-primary">Create Auction</RouterLink>
</div>
```

### 10.3 Success Feedback

**Provide confirmation for:**
- Account created
- Logged in
- Auction created
- Bid placed
- Question asked
- Question answered

**Methods:**
- Toast notifications (recommended)
- Inline success messages
- Redirect with success message

### 10.4 Accessibility

**Requirements:**
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<button>`)
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus states on interactive elements
- Sufficient color contrast (WCAG AA)

---

## 11. Implementation Checklist

### Phase 1: Setup & Infrastructure
- [ ] Initialize Vite + Vue 3 project
- [ ] Install dependencies (Vue Router, Pinia, Axios, Tailwind)
- [ ] Configure Tailwind CSS
- [ ] Set up project structure (folders, files)
- [ ] Create API service layer with interceptors
- [ ] Set up Vue Router with routes
- [ ] Create Pinia stores (auth, drafts)

### Phase 2: Core Pages (No Auth Required)
- [ ] HomeView - Browse auctions
  - [ ] Implement search bar
  - [ ] Implement category filter
  - [ ] Create AuctionCard component
  - [ ] Implement pagination
- [ ] AuctionDetailView - View single auction
  - [ ] Display item details
  - [ ] Show bid history
  - [ ] Show Q&A section
  - [ ] Handle closed auctions

### Phase 3: Authentication
- [ ] LoginView
  - [ ] Create form with validation
  - [ ] Implement login API call
  - [ ] Handle success (store token, redirect)
  - [ ] Handle errors
- [ ] RegisterView
  - [ ] Create form with all fields
  - [ ] Implement password validation with visual indicators
  - [ ] Implement register API call
  - [ ] Handle success and errors
- [ ] AppHeader component
  - [ ] Conditional navigation based on auth
  - [ ] Logout functionality
  - [ ] User name display

### Phase 4: Authenticated Features
- [ ] AuctionDetailView (authenticated features)
  - [ ] Implement bid placement
  - [ ] Implement ask question
  - [ ] Implement answer question (if seller)
  - [ ] Conditional rendering based on ownership
- [ ] CreateAuctionView
  - [ ] Build complete form
  - [ ] Fetch and display categories
  - [ ] Implement date/time picker
  - [ ] Implement form submission
- [ ] MyAuctionsView
  - [ ] Implement tabs (Selling, Bidding, Archive)
  - [ ] Fetch status-filtered items
  - [ ] Display items using AuctionCard

### Phase 5: Extension Task 3 - Drafts
- [ ] Create drafts store
- [ ] Implement auto-save in CreateAuctionView
- [ ] Add save draft button
- [ ] Add load draft dropdown
- [ ] Add delete draft functionality
- [ ] Show last saved timestamp

### Phase 6: Polish & UX
- [ ] Add loading spinners
- [ ] Add empty states
- [ ] Add success/error toasts or messages
- [ ] Implement responsive design (mobile, tablet, desktop)
- [ ] Add form validation feedback
- [ ] Test all user flows
- [ ] Fix accessibility issues

### Phase 7: Testing
- [ ] Test registration with valid/invalid data
- [ ] Test login with valid/invalid credentials
- [ ] Test auction creation with all fields
- [ ] Test bidding (edge cases: too low, own item, closed auction)
- [ ] Test Q&A functionality
- [ ] Test search and filters
- [ ] Test drafts (save, load, delete, auto-save)
- [ ] Test responsive design on different screen sizes
- [ ] Test with backend running on localhost:3333

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Final Notes

### Do's:
✅ Follow Vue 3 Composition API best practices
✅ Use computed properties for derived data
✅ Use reactive() or ref() for state
✅ Handle all error cases gracefully
✅ Validate user input before API calls
✅ Show loading states during async operations
✅ Make UI responsive for all screen sizes
✅ Test with actual backend API
✅ Clear sensitive data on logout
✅ Use semantic HTML for accessibility

### Don'ts:
❌ Don't store passwords in localStorage
❌ Don't ignore error responses from API
❌ Don't make API calls without error handling
❌ Don't hardcode user IDs or tokens
❌ Don't skip form validation
❌ Don't create auctions with past dates
❌ Don't allow users to bid on their own items
❌ Don't forget to handle edge cases (empty arrays, null values)
❌ Don't use inline styles (use CSS classes)
❌ Don't skip responsive design

---

**This document provides complete specifications for building the Auctionary frontend. Follow each section carefully, implement features systematically, and test thoroughly with the backend API running on localhost:3333.**
