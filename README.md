# Crystal Beauty Clear Backend

Crystal Beauty Clear is a robust backend for an e-commerce platform specializing in beauty products. Built with Node.js, Express, and MongoDB, it provides secure user authentication, product management, order processing, and review systems with role-based access control for users and admins.

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Running the Application](#running-the-application)
-   [API Endpoints](#api-endpoints)
    -   [Authentication](#authentication)
    -   [Users](#users)
    -   [Products](#products)
    -   [Orders](#orders)
-   [Middleware](#middleware)
-   [Models](#models)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   **User Authentication**: Secure sign-up, sign-in, and Google OAuth login with JWT-based authentication.
-   **Email Verification**: OTP-based email verification for secure user registration and password changes.
-   **Role-Based Access Control**: Separate permissions for users and admins.
-   **Product Management**: Create, update, delete, and search products with inventory tracking.
-   **Order Processing**: Place orders, update statuses, and manage inventory with validation.
-   **Review System**: Users can add and delete reviews; admins can hide reviews.
-   **Security**: Rate limiting, password hashing with Argon2, and HTTP security headers via Helmet.
-   **Error Handling**: Comprehensive error handling for invalid requests, validation errors, and duplicate entries.

## Tech Stack

-   **Node.js**: JavaScript runtime for server-side execution.
-   **Express**: Web framework for building RESTful APIs.
-   **MongoDB**: NoSQL database with Mongoose for data modeling.
-   **Argon2**: Password hashing for secure user authentication.
-   **JWT**: JSON Web Tokens for session management.
-   **Nodemailer**: Email service for sending OTP verification codes.
-   **Helmet**: Security middleware for HTTP headers.
-   **Morgan**: HTTP request logging.
-   **Rate-Limit**: Prevents brute-force attacks with request limiting.
-   **CORS**: Enables secure cross-origin requests.
-   **Axios**: HTTP client for Google OAuth integration.

## Project Structure

```
├── config
│   └── env.js                # Environment variables (PORT, MongoDB, JWT, etc.)
├── controllers
│   ├── auth.controller.js    # Authentication-related logic
│   ├── order.controller.js   # Order management logic
│   ├── product.controller.js # Product management logic
│   ├── user.controller.js    # User management logic
├── middleware
│   ├── auth.middleware.js    # JWT, user, and admin authentication
│   ├── error.middleware.js   # Centralized error handling
│   ├── rateLimiter.middleware.js # Rate limiting for API requests
├── models
│   ├── order.model.js        # Order schema
│   ├── product.model.js      # Product schema
│   ├── user.model.js         # User schema
│   ├── verificationCode.model.js # Verification code schema
├── routes
│   ├── auth.route.js         # Authentication routes
│   ├── order.route.js        # Order routes
│   ├── products.route.js     # Product routes
│   ├── user.route.js         # User routes
├── utils
│   ├── argon2.util.js        # Password hashing utilities
│   ├── jwt.util.js           # JWT token generation
├── index.js                  # Main application entry point
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-repo/crystal-beauty-clear.git
    cd crystal-beauty-clear
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3000
    MONGO_DB_CONN_STRING=your_mongodb_connection_string
    PEPPER=your_pepper_for_argon2
    JWT_KEY=your_jwt_secret_key
    EMAIL=your_email_for_nodemailer
    APP_PASSWORD=your_app_password_for_nodemailer
    FRONTEND_URL=http://your-frontend-url
    ```

## Configuration

-   **MongoDB**: Ensure a MongoDB instance is running locally or use a cloud provider like MongoDB Atlas.
-   **Nodemailer**: Configure a Gmail account with an app-specific password for sending OTP emails.
-   **Environment Variables**:
    -   `PORT`: Port for the server (default: 3000).
    -   `MONGO_DB_CONN_STRING`: MongoDB connection URI.
    -   `PEPPER`: Secret for Argon2 password hashing.
    -   `JWT_KEY`: Secret for JWT token signing.
    -   `EMAIL`: Gmail address for sending emails.
    -   `APP_PASSWORD`: Gmail app-specific password.
    -   `FRONTEND_URL`: Frontend URL for CORS configuration.

## Running the Application

1. **Start the server**:

    ```bash
    npm start
    ```

2. The server will run on `http://localhost:3000` (or the specified `PORT`).

3. **Test API endpoints** using tools like Postman or curl.

## API Endpoints

### Authentication

-   **POST /api/auth/sign-up**

    -   Registers a new user with email verification.
    -   Body: `{ data: { username, avatar, email, password }, code }`
    -   Requires: OTP verification code.

-   **POST /api/auth/sign-in**

    -   Logs in a user and returns a JWT.
    -   Body: `{ email, password }`

-   **GET /api/auth/check-admin**

    -   Checks if the user is an admin.
    -   Requires: Admin JWT.

-   **POST /api/auth/check-user**

    -   Checks if a user exists by email.
    -   Body: `{ email }`

-   **POST /api/auth/create-admin**

    -   Creates a new admin user.
    -   Body: `{ username, avatar, email, password }`
    -   Requires: Admin JWT.

-   **POST /api/auth/google-login**

    -   Logs in a user via Google OAuth.
    -   Body: `{ accessToken }`

-   **POST /api/auth/send-code**

    -   Sends an OTP to the user's email.
    -   Body: `{ email }`

-   **PUT /api/auth/user/change-password**
    -   Changes the user's password with OTP verification.
    -   Body: `{ data: { email, password }, code }`
    -   Requires: OTP verification code.

### Users

-   **GET /api/users/**

    -   Fetches all users with optional search query.
    -   Query: `?query=search_term`
    -   Requires: Admin JWT.

-   **GET /api/users/admins**

    -   Fetches all admin users.
    -   Requires: Admin JWT.

-   **GET /api/users/user/:id**

    -   Fetches a user by ID.
    -   Requires: User or Admin JWT.

-   **PUT /api/users/user/:id/update-user**

    -   Updates a user's avatar.
    -   Body: `{ avatar }`
    -   Requires: User JWT.

-   **PUT /api/users/ban-user**
    -   Bans or unbans a user.
    -   Body: `{ userId, banned }`
    -   Requires: Admin JWT.

### Products

-   **POST /api/products/custom**

    -   Fetches products based on custom criteria.
    -   Body: `{ criteria }`

-   **GET /api/products/search**

    -   Searches products by name, keywords, or category.
    -   Query: `?query=search_term`

-   **GET /api/products/:productId**

    -   Fetches a product by ID with reviews.

-   **POST /api/products/add-new**

    -   Creates a new product.
    -   Body: `{ name, description, images, category, brand, keywords, priceInfo, inventory }`
    -   Requires: Admin JWT.

-   **POST /api/products/:productId/add-review**

    -   Adds a review to a product.
    -   Body: `{ userId, rating, description }`
    -   Requires: User JWT, product purchase.

-   **DELETE /api/products/:productId/reviews/:reviewId**

    -   Deletes a user's review.
    -   Requires: User JWT (review author).

-   **DELETE /api/products/:productId**

    -   Deletes a product.
    -   Requires: Admin JWT.

-   **PUT /api/products/:productId**

    -   Updates a product.
    -   Body: `{ name, description, images, category, brand, bestSeller, keywords, priceInfo, inventory }`
    -   Requires: Admin JWT.

-   **PUT /api/products/:productId/hide-review**
    -   Hides or shows a review.
    -   Body: `{ reviewId, hidden }`
    -   Requires: Admin JWT.

### Orders

-   **GET /api/orders/:status**

    -   Fetches orders by status with optional search query.
    -   Query: `?query=search_term`
    -   Requires: Admin JWT.

-   **GET /api/orders/:userId/my-orders**

    -   Fetches a user's orders.
    -   Requires: User JWT.

-   **GET /api/orders/order/:orderId**

    -   Fetches an order by ID.
    -   Requires: User or Admin JWT.

-   **POST /api/orders/place-order**

    -   Places a new order and updates inventory.
    -   Body: `{ userId, deliveryDetails, paymentMethod, products }`
    -   Requires: User JWT.

-   **PUT /api/orders/update/:orderId**
    -   Updates an order's status.
    -   Body: `{ status }`
    -   Requires: User or Admin JWT.

## Middleware

-   **authMiddleware**: Validates JWT tokens and attaches user data to requests.
-   **verifyUser**: Ensures the user is authenticated.
-   **verifyAdmin**: Restricts access to admin-only routes.
-   **verifyCode**: Validates OTP codes for secure operations.
-   **errorHandler**: Handles errors like invalid IDs, duplicate keys, and validation failures.
-   **globalRateLimiter**: Limits requests to 100 per 15 minutes.
-   **authRateLimiter**: Limits authentication requests to 5 per 5 minutes.

## Models

-   **User**: Stores user details (username, email, password, avatar, role, banned status).
-   **Product**: Manages product details (name, description, images, category, brand, inventory, reviews).
-   **Order**: Tracks order details (userId, delivery details, payment method, products, status).
-   **VerificationCode**: Stores temporary OTP codes for email verification.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
