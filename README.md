# 🔨 BidHub — Real-Time Online Auction Platform

A full-stack real-time auction and bidding web application built with React, Node.js, Socket.IO, and MongoDB.

---

## 🚀 Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router v6 |
| Real-time   | Socket.IO (client + server)            |
| Backend     | Node.js, Express.js                    |
| Database    | MongoDB with Mongoose                  |
| Auth        | JWT + bcrypt, role-based access        |

---

## 🗂️ Project Structure

```
auction-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AuctionCard.jsx
│   │   │   ├── BidForm.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── Notification.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Auctions.jsx
│   │   │   ├── AuctionDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MyBids.jsx
│   │   │   ├── WonAuctions.jsx
│   │   │   ├── seller/
│   │   │   │   ├── CreateAuction.jsx
│   │   │   │   ├── ManageAuctions.jsx
│   │   │   │   └── EditAuction.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       └── AuctionManagement.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios API service
│   │   └── socket/
│   │       └── socket.js     # Socket.IO client singleton
│
└── server/                  # Express backend
    ├── controllers/
    │   ├── authController.js
    │   ├── auctionController.js
    │   ├── bidController.js
    │   └── adminController.js
    ├── models/
    │   ├── User.js
    │   ├── Auction.js
    │   └── Bid.js
    ├── routes/
    │   ├── auth.js
    │   ├── auctions.js
    │   ├── bids.js
    │   └── admin.js
    ├── middleware/
    │   ├── auth.js
    │   └── roleCheck.js
    ├── socket/
    │   └── bidSocket.js      # Real-time bidding logic
    ├── seed.js               # Database seeder
    └── server.js             # Entry point
```

---

## ⚙️ Local Setup

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://cloud.mongodb.com))
- **npm** or **yarn**

---

### 1. Clone / Extract

```bash
cd auction-app
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auctiondb
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

*(For MongoDB Atlas, replace `MONGO_URI` with your connection string.)*

**Seed the database** (optional but recommended for demo):

```bash
node seed.js
```

This creates:
- 👤 **Admin**: `admin@demo.com` / `password123`
- 🏷️ **Seller**: `seller@demo.com` / `password123`
- 👋 **User**: `user@demo.com` / `password123`
- 7 sample auction listings with bids

**Start the backend:**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Start the frontend:**

```bash
npm run dev
```

App runs on: `http://localhost:5173`

---

## 📡 API Reference

### Auth
| Method | Route                  | Access  | Description          |
|--------|------------------------|---------|----------------------|
| POST   | `/api/auth/register`   | Public  | Register new user    |
| POST   | `/api/auth/login`      | Public  | Login & get JWT      |
| GET    | `/api/auth/me`         | Private | Get current user     |
| PUT    | `/api/auth/profile`    | Private | Update profile       |

### Auctions
| Method | Route                       | Access        | Description           |
|--------|-----------------------------|---------------|-----------------------|
| GET    | `/api/auctions`             | Public        | List auctions (filter/sort/paginate) |
| GET    | `/api/auctions/:id`         | Public        | Get auction details   |
| POST   | `/api/auctions`             | Seller/Admin  | Create auction        |
| PUT    | `/api/auctions/:id`         | Seller/Admin  | Update auction        |
| DELETE | `/api/auctions/:id`         | Seller/Admin  | Delete auction        |
| GET    | `/api/auctions/seller/my`   | Seller/Admin  | My auction listings   |

### Bids
| Method | Route                    | Access  | Description           |
|--------|--------------------------|---------|-----------------------|
| POST   | `/api/bids`              | Private | Place a bid           |
| GET    | `/api/bids/:auctionId`   | Public  | Get auction bids      |
| GET    | `/api/bids/user/history` | Private | User's bid history    |
| GET    | `/api/bids/user/won`     | Private | User's won auctions   |

### Admin
| Method | Route                           | Access | Description         |
|--------|---------------------------------|--------|---------------------|
| GET    | `/api/admin/stats`              | Admin  | Platform stats      |
| GET    | `/api/admin/users`              | Admin  | All users           |
| PUT    | `/api/admin/users/:id`          | Admin  | Update user role    |
| DELETE | `/api/admin/users/:id`          | Admin  | Delete user         |
| GET    | `/api/admin/auctions`           | Admin  | All auctions        |
| PUT    | `/api/admin/auctions/:id/feature` | Admin | Toggle featured    |

---

## ⚡ Socket.IO Events

| Event           | Direction        | Description                         |
|-----------------|------------------|-------------------------------------|
| `join_auction`  | Client → Server  | Join auction room for live updates  |
| `leave_auction` | Client → Server  | Leave auction room                  |
| `check_auction` | Client → Server  | Request current auction status      |
| `new_bid`       | Server → Client  | New bid placed (broadcast to room)  |
| `auction_ended` | Server → Client  | Auction ended with winner           |
| `auction_status`| Server → Client  | Current status response             |

---

## 👥 User Roles

| Role   | Permissions                                                    |
|--------|----------------------------------------------------------------|
| User   | Browse auctions, place bids, view bid history, won auctions   |
| Seller | All user permissions + create/manage/delete own listings      |
| Admin  | All permissions + manage users, all auctions, analytics       |

---

## 🌐 Deployment

### Frontend → Vercel

1. Push `client/` folder to a GitHub repo
2. Import into [Vercel](https://vercel.com)
3. Set environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_SOCKET_URL` = your Render backend URL

### Backend → Render

1. Push `server/` folder to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables from `.env`

### Database → MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` in Network Access
3. Copy connection string to `MONGO_URI`

---

## 📦 Features Summary

- ✅ JWT authentication with role-based access (User / Seller / Admin)
- ✅ Real-time bidding via Socket.IO
- ✅ Live countdown timers with urgency indicators
- ✅ Auto-close expired auctions (background job every 30s)
- ✅ Winner selection and notification
- ✅ Auction categories, search, sort, pagination
- ✅ Seller dashboard with analytics
- ✅ Admin panel with user management and stats
- ✅ Featured auction support
- ✅ Responsive dark-mode UI
- ✅ Toast notifications for all events
- ✅ Quick bid buttons
- ✅ Bid history per auction

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Protected routes validated server-side
- Sellers cannot bid on their own auctions
- Admins cannot delete/deactivate their own account
- Role escalation prevented on registration

---

© 2026 Tech By WebCoder. All rights reserved. This Project is protected by copyright. Any unauthorized , distribution, or exhibition of this Frontend Project, in whole or in part, is strictly prohibited.
