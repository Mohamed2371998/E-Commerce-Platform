# E-Commerce API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zipCode": "",
      "country": ""
    },
    "wishlist": []
  }
}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

---

## 📦 Product Endpoints

### Get All Products
```http
GET /products?page=1&limit=10&category=Electronics&minPrice=10&maxPrice=100&sort=-createdAt
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search query
- `brand` - Filter by brand
- `featured` - Get featured products only
- `sort` - Sort field (prefix with - for descending)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "data": [
    {
      "_id": "...",
      "name": "Wireless Headphones",
      "description": "Premium wireless headphones",
      "price": 99.99,
      "comparePrice": 149.99,
      "images": ["https://..."],
      "category": "Electronics",
      "brand": "AudioTech",
      "inventory": {
        "quantity": 50,
        "lowStockThreshold": 10
      },
      "rating": 4.5,
      "numReviews": 10,
      "discountPercentage": 33
    }
  ]
}
```

### Get Single Product
```http
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Wireless Headphones",
    "description": "Premium wireless headphones",
    "price": 99.99,
    "images": ["https://..."],
    "category": "Electronics",
    "reviews": [
      {
        "user": "...",
        "name": "Jane Doe",
        "rating": 5,
        "comment": "Great product!",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "stockStatus": "in_stock"
  }
}
```

### Create Product (Vendor/Admin)
```http
POST /products
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "comparePrice": 59.99,
  "images": ["https://example.com/image.jpg"],
  "category": "Electronics",
  "brand": "Brand Name",
  "inventory": {
    "quantity": 100,
    "lowStockThreshold": 10
  },
  "tags": ["tag1", "tag2"],
  "isFeatured": true
}
```

### Add Review
```http
POST /products/:id/reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product! Highly recommended."
}
```

---

## 🛒 Cart Endpoints

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "...",
        "product": {
          "_id": "...",
          "name": "Wireless Headphones",
          "images": ["https://..."],
          "price": 99.99,
          "inventory": { "quantity": 50 }
        },
        "quantity": 2,
        "price": 99.99,
        "variant": {}
      }
    ],
    "subtotal": 199.98,
    "discountAmount": 20,
    "total": 179.98,
    "itemCount": 2,
    "coupon": {
      "code": "SAVE10",
      "discount": 10,
      "discountType": "percentage"
    }
  }
}
```

### Add to Cart
```http
POST /cart/items
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "...",
  "quantity": 2,
  "variant": {
    "name": "Color",
    "option": "Black"
  }
}
```

### Update Cart Item
```http
PUT /cart/items/:itemId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/items/:itemId
Authorization: Bearer <token>
```

### Apply Coupon
```http
POST /cart/coupon
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "SAVE10"
}
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

---

## 📋 Order Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "card",
  "notes": "Please gift wrap this order"
}
```

**Response (Card Payment):**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-ABC123",
      "items": [...],
      "prices": {
        "subtotal": 199.98,
        "shipping": 10,
        "tax": 20,
        "discount": 20,
        "total": 209.98
      },
      "status": "pending"
    },
    "clientSecret": "pi_..._secret_..."
  }
}
```

### Get My Orders
```http
GET /orders/myorders?page=1&limit=10
Authorization: Bearer <token>
```

### Get Order Details
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Cancel Order
```http
PUT /orders/:id/cancel
Authorization: Bearer <token>
```

---

## 👤 User Endpoints

### Get Wishlist
```http
GET /users/wishlist
Authorization: Bearer <token>
```

### Add to Wishlist
```http
POST /users/wishlist
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "..."
}
```

### Remove from Wishlist
```http
DELETE /users/wishlist/:productId
Authorization: Bearer <token>
```

---

## 🎟️ Coupon Endpoints

### Validate Coupon
```http
POST /coupons/validate
```

**Request Body:**
```json
{
  "code": "SAVE10",
  "subtotal": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "SAVE10",
    "discountType": "percentage",
    "discountValue": 10,
    "discount": 10,
    "minimumPurchase": 0
  }
}
```

---

## 📊 Admin Endpoints

### Get All Orders
```http
GET /orders?status=pending&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Update Order Status
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456",
  "carrier": "UPS"
}
```

### Get Order Statistics
```http
GET /orders/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "ordersToday": 5,
    "totalRevenue": 15000.50,
    "monthlyRevenue": 5000.25,
    "ordersByStatus": [
      { "_id": "pending", "count": 10 },
      { "_id": "processing", "count": 5 },
      { "_id": "shipped", "count": 20 },
      { "_id": "delivered", "count": 115 }
    ]
  }
}
```

### Get All Users
```http
GET /users?role=user&search=john&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Create Coupon
```http
POST /coupons
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "code": "SUMMER20",
  "description": "20% off summer sale",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumPurchase": 50,
  "maximumDiscount": 100,
  "usageLimit": 100,
  "startDate": "2024-06-01",
  "endDate": "2024-08-31"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized as admin"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "stack": "..." // Only in development
}
```

---

## 📱 Stripe Payment Flow

### 1. Create Order
Create an order with `paymentMethod: "card"` to get the `clientSecret`.

### 2. Initialize Stripe on Frontend
```javascript
const stripe = Stripe('pk_test_your_publishable_key');
const elements = stripe.elements();
```

### 3. Confirm Payment
```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'John Doe',
      },
    },
  }
);
```

### 4. Webhook Handling
The backend automatically handles Stripe webhooks to update order status.

---

## 🔗 Postman Collection

You can import the following collection to test the API:

[Download Postman Collection](./postman-collection.json)
