# 🏍️ SumonMoto Parts — Server

The REST API powering **SumonMoto Parts**, a motorcycle spare-parts e-commerce platform. Handles authentication, user roles, product catalog, orders, and reviews on top of Node.js, Express, and MongoDB.

🔗 **Live site:** [sumonmoto-parts.web.app](https://sumonmoto-parts.web.app/)

## ✨ Features

- 🔐 JWT-based authentication with role support (`user` / `admin`)
- 🔁 Role toggling for admin management
- 🛒 Product catalog with search, category/brand/compatibility filters, and sorting (price, newest, popularity)
- 📦 Stock management — add or deduct quantity with insufficient-stock checks
- 🧾 Order creation, listing, updating, and deletion
- ⭐ Customer reviews (create & fetch)
- 🌍 CORS configured for local dev and the production frontend

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (native driver) |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Config | dotenv |

## 📁 Project Structure

```
├── config/database.js             # MongoDB connection & collections
├── controllers/                   # Business logic (users, products, orders, reviews)
├── routes/                        # Express route definitions
├── middleware/authMiddleware.js   # JWT verification
├── utils/generateToken.js         # JWT signing helper
└── index.js                       # App entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- A MongoDB Atlas cluster (or compatible URI)

### Installation

```bash
git clone https://github.com/Iam-abdulahad/sumonmoto-parts-server.git
cd sumonmoto-parts-server
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
JWT_SECRET=your_jwt_secret
```

### Run

```bash
npm run start-dev   # development, with nodemon
npm start            # production
```

The server boots on `http://localhost:5000` by default.

## 📡 API Endpoints

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Register or log in a user (returns JWT) |
| GET | `/users` | Get all users |
| GET | `/user/:uid` | Get a single user |
| PUT | `/users/:uid` | Update user info or toggle role |
| DELETE | `/users/:uid` | Delete a user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List products (supports `search`, `category`, `brand`, `compatibility`, `sort`) |
| GET | `/make_order/:id` | Get a single product for checkout |
| POST | `/products` | Create a product |
| PATCH | `/products/:id` | Add/deduct stock quantity |
| DELETE | `/products/:id` | Delete a product |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders` | List orders |
| POST | `/orders` | Create an order |
| PUT | `/orders/:id` | Update an order |
| DELETE | `/orders/:id` | Delete an order |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/reviews` | Create a review |
| GET | `/reviews` | List reviews |

## 👤 Author

**Md Ahad Ali** — [GitHub](https://github.com/Iam-abdulahad)
