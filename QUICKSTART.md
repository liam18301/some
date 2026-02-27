# Quick Start Guide - Jambostar Backend Setup

## 🚀 Get Running in 5 Minutes

### Step 1: Install Node.js (if not already installed)
Download from: https://nodejs.org/ (LTS version recommended)

### Step 2: Navigate to Your Project
```bash
cd /home/allan-kariuki/Downloads/s
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Get M-Pesa Credentials (IMPORTANT!)
1. Go to https://developer.safaricom.co.ke/
2. Sign up or login
3. Create a new app
4. Copy your credentials:
   - Consumer Key
   - Consumer Secret
   - Business Short Code (usually 174379 for sandbox)
   - Passkey

### Step 5: Update .env File
Open `.env` file and replace:
```env
MPESA_CONSUMER_KEY=paste_your_consumer_key
MPESA_CONSUMER_SECRET=paste_your_consumer_secret
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=paste_your_passkey
```

### Step 6: Start the Backend
```bash
npm start
```

Expected output:
```
✅ Jambostar Backend running on http://localhost:3000
```

### Step 7: Open Frontend in Browser
Open `some.html` in your web browser (or serve with `python -m http.server 8000`)

### Step 8: Test Payment
1. Select date, route, and seats
2. Enter phone: `254712345678` (sandbox test number)
3. Enter name: Your name
4. Click "PAY & GENERATE TICKET"
5. Check terminal for logs

---

## 📁 Files Created

✅ `server.js` - Main backend server  
✅ `package.json` - Dependencies  
✅ `.env` - Configuration (keep private!)  
✅ `.env.example` - Template  
✅ `.gitignore` - For Git  
✅ `README.md` - Full documentation  
✅ `QUICKSTART.md` - This file  

---

## 🔗 Important URLs

- **Backend:** http://localhost:3000
- **M-Pesa API:** https://developer.safaricom.co.ke/
- **Frontend:** `some.html` (open in browser)

---

## ⚡ Commands Reference

```bash
# Install packages
npm install

# Run server (production)
npm start

# Run server with auto-reload (development)
npm run dev

# Check if backend is working
curl http://localhost:3000/health
```

---

## 🐛 Common Issues

**"Cannot find module"** → Run `npm install`  
**"M-Pesa credentials invalid"** → Check `.env` file against Daraja  
**"CORS errors"** → Backend already has CORS enabled  
**"Port 3000 already in use"** → Change PORT in `.env`

---

That's it! You're ready to go. For detailed info, see `README.md` 📖
