# 🛒 E-Commerce Platform API

A full-featured e-commerce backend API built with Node.js, Express, MongoDB, and Stripe payment integration.

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control (User, Vendor, Admin)
- 📦 **Product Management** - Full CRUD operations with categories, variants, and inventory
- 🛒 **Shopping Cart** - Persistent cart with coupon support
- 💳 **Payment Integration** - Stripe payment processing with webhook support
- 📋 **Order Management** - Complete order lifecycle with status tracking
- 🎟️ **Coupon System** - Flexible discount codes with various rules
- ❤️ **Wishlist** - Save favorite products
- ⭐ **Reviews & Ratings** - Product reviews with average ratings
- 📊 **Admin Dashboard** - Statistics and order management

### Technical Features
- 🛡️ **Security** - Helmet, CORS, Rate Limiting
- ✅ **Validation** - Input validation with express-validator
- 📝 **Logging** - Request logging with Morgan
- 🧪 **Testing** - Jest test framework setup
- 🔄 **Error Handling** - Centralized error handling middleware

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ecommerce-backend.git
cd ecommerce-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

4. **Seed the database** (optional)
```bash
npm run seed
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/profile` | Get user profile | Private |
| PUT | `/auth/profile` | Update profile | Private |
| PUT | `/auth/password` | Change password | Private |

### Product Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | Get all products | Public |
| GET | `/products/:id` | Get single product | Public |
| GET | `/products/featured` | Get featured products | Public |
| GET | `/products/categories` | Get all categories | Public |
| POST | `/products` | Create product | Vendor/Admin |
| PUT | `/products/:id` | Update product | Vendor/Admin |
| DELETE | `/products/:id` | Delete product | Vendor/Admin |
| POST | `/products/:id/reviews` | Add review | Private |

### Cart Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/cart` | Get cart | Private |
| POST | `/cart/items` | Add item to cart | Private |
| PUT | `/cart/items/:id` | Update item quantity | Private |
| DELETE | `/cart/items/:id` | Remove item | Private |
| DELETE | `/cart` | Clear cart | Private |
| POST | `/cart/coupon` | Apply coupon | Private |
| DELETE | `/cart/coupon` | Remove coupon | Private |

### Order Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/orders` | Create order | Private |
| GET | `/orders/myorders` | Get my orders | Private |
| GET | `/orders/:id` | Get order details | Private |
| PUT | `/orders/:id/cancel` | Cancel order | Private |
| GET | `/orders` | Get all orders | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |
| GET | `/orders/stats` | Get order statistics | Admin |

### User Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users/wishlist` | Get wishlist | Private |
| POST | `/users/wishlist` | Add to wishlist | Private |
| DELETE | `/users/wishlist/:id` | Remove from wishlist | Private |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Coupon Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/coupons/validate` | Validate coupon | Public |
| GET | `/coupons` | Get all coupons | Admin |
| POST | `/coupons` | Create coupon | Admin |
| PUT | `/coupons/:id` | Update coupon | Admin |
| DELETE | `/coupons/:id` | Delete coupon | Admin |

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 💳 Stripe Payment Integration

### Setting up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Add them to your `.env` file

### Payment Flow

1. **Create Order** - Client creates an order with `paymentMethod: 'card'`
2. **Get Client Secret** - Server returns `clientSecret` from Stripe
3. **Confirm Payment** - Client uses Stripe.js to confirm payment
4. **Webhook** - Stripe sends webhook to confirm payment status

### Testing Stripe Webhook Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/orders/webhook
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

## 📁 Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── couponController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── validators.js     # Input validation
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Coupon.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── coupons.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── users.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── seeder.js
│   └── server.js
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛡️ Security Features

- **Helmet** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Sanitize user inputs
- **Password Hashing** - bcryptjs
- **JWT Tokens** - Secure authentication

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For webhooks |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [your.email@example.com](mailto:your.email@example.com)

---

⭐ Star this repo if you find it helpful!
