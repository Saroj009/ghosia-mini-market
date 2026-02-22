# Ghosia Mini Market - Mobile App

React Native Expo mobile app for Ghosia Mini Market.

## Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Get your MacBook's IP address:
```bash
ipconfig getifaddr en0
```

3. Update `App.js` with your IP address:
   - Open `mobile/App.js`
   - Change line 6: `const API_URL = 'http://YOUR_IP:5173';`
   - Replace `YOUR_IP` with the IP from step 2

4. Make sure the frontend is running:
```bash
# In the frontend folder, run with network access:
npm run dev -- --host
```

5. Start the mobile app:
```bash
npm start
```

6. On your iPhone:
   - Install **Expo Go** from the App Store
   - Scan the QR code with your iPhone camera
   - The app will open in Expo Go!

## Requirements

- iPhone and MacBook must be on the same WiFi network
- Frontend server must be running with `--host` flag
- Expo Go app installed on iPhone
