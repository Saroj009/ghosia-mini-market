# 📱 Ghosia Mini Market - Mobile App

React Native Expo mobile app for Ghosia Mini Market.

## 🚀 Quick Start

### 1. Setup Backend

Make sure your backend is running:

```bash
cd ~/Desktop/grocery-app/backend
node index.js
```

Backend should run on: `http://localhost:3000`

### 2. Find Your IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address"
```

You'll get something like: `192.168.1.100`

### 3. Update API URL

Edit `mobile/App.js` line 7:

```javascript
const API_URL = 'http://YOUR_IP_HERE:3000/api';
```

Replace `YOUR_IP_HERE` with your actual IP:

```javascript
const API_URL = 'http://192.168.1.100:3000/api';
```

### 4. Install & Run

```bash
cd ~/Desktop/grocery-app/mobile
npm install
npm start
```

### 5. Open on Your Phone

1. Install **Expo Go** app from:
   - iPhone: App Store
   - Android: Google Play Store

2. Scan the QR code from Terminal

## ✨ Features

- 🛒 Browse products by category
- 🔍 Search functionality
- 🛍️ Shopping cart with quantity controls
- 👤 Customer login & registration
- 💳 Checkout & order placement
- 📦 Orders saved to database
- 🔐 Admin access (view on web)

## 🎯 Test Accounts

**Customer:**
- Create new account via Register

**Admin (web only):**
- Email: `ghosia@gmail.com`
- Password: `ghosia123456`

## 📱 App Structure

- **Shop Page**: Browse and search products
- **Cart**: Manage items, quantities
- **Checkout**: Enter delivery & payment info
- **Auth**: Login/Register
- **Success**: Order confirmation

## 🐛 Troubleshooting

**App shows blank screen:**
- Check if backend is running
- Verify IP address is correct
- Make sure phone and computer are on same WiFi

**Can't connect to API:**
- Restart backend server
- Check firewall settings
- Try using your computer's actual IP, not `localhost`

**Products not loading:**
- Open browser: `http://YOUR_IP:3000/api/products`
- Should return JSON data
- If not, backend isn't accessible

## 🎨 Customization

Edit `App.js` to customize:
- Colors in `StyleSheet`
- Product emojis in `PRODUCT_EMOJIS`
- API URL for production

## 📦 Build for Production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

Requires Expo account: https://expo.dev

---

**Ghosia Mini Market** - Fresh & Authentic Nepali Groceries 🛒