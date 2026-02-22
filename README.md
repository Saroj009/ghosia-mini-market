# 🛒 Ghosia Mini Market - Full Stack E-Commerce

A modern, full-stack grocery e-commerce website for Ghosia Mini Market - a Nepali/Indian/Asian grocery store in Birmingham, UK.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Customer Features
- ✅ **Guest Checkout** - Shop without creating an account
- 🛒 **Smart Shopping Cart** - Persistent cart saved in browser
- 🎁 **Promo Codes** - Apply discount codes at checkout
- 📱 **Fully Responsive** - Works perfectly on mobile and desktop
- 🔍 **Product Search & Filter** - Find products by name or category
- 💳 **Simple Checkout** - Easy payment process
- 👤 **Optional Account Creation** - Create account during checkout for faster future orders

### Admin Features
- 🛡️ **Admin Dashboard** - Manage products and inventory
- ➕ **Product Management** - Add, edit, delete products
- 📸 **Image Upload** - Upload product images or use URLs
- 📊 **Real-time Stats** - View product counts and inventory
- 🔐 **Secure Authentication** - JWT-based admin access

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Vanilla CSS** - Custom styling with modern design

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### 1. Clone Repository
```bash
git clone https://github.com/Saroj009/ghosia-mini-market.git
cd ghosia-mini-market
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB credentials
nano .env
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 🌐 Production Deployment

### Frontend (Vercel/Netlify)

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel:**
```bash
npm i -g vercel
vercel --prod
```

Or use Netlify:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Backend (Railway/Render/Heroku)

**Option 1: Railway**
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables
4. Deploy automatically

**Option 2: Render**
1. Connect GitHub repo
2. Select "Web Service"
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add environment variables

**Option 3: Heroku**
```bash
heroku create ghosia-mini-market-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎁 Promo Codes

Built-in promo codes for testing:
- **WELCOME10** - 10% off your order
- **SAVE5** - £5 off your order
- **FIRST20** - 20% off first order
- **FREESHIP** - Free shipping

## 👤 Admin Access

To create an admin account:

1. Register a normal account
2. Access MongoDB Atlas
3. Find your user in the `users` collection
4. Change `role` from `"customer"` to `"admin"`

## 📂 Project Structure

```
ghosia-mini-market/
├── frontend/
│   ├── src/
│   │   └── App.jsx          # Main React component
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── index.js             # Express server & API
│   ├── uploads/             # Product images
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ('customer' | 'admin'),
  phone: String,
  address: String,
  createdAt: Date
}
```

### Products Collection
```javascript
{
  name: String,
  price: Number,
  category: String,
  stock: Number,
  image: String (URL),
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products (Public)
- `GET /api/products` - List all products

### Admin (Protected)
- `POST /api/admin/products` - Add product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/upload` - Upload image

## 🏪 Store Information

**Ghosia Mini Market**
- 📍 Address: 349 High Street, Birmingham, B70 9QG
- 📞 Phone: 079192728
- ✉️ Email: Ghosia5791@gmail.com
- 🕒 Hours: Mon-Sun, 9:00 AM - 9:00 PM
- 🌏 Specialty: Nepali, Indian & Asian groceries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Images from Unsplash
- Icons and emojis for enhanced UX
- MongoDB Atlas for cloud database
- Vercel/Railway for hosting platforms

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the store directly.

---

**Made with ❤️ for Ghosia Mini Market, Birmingham**