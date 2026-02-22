# Jambostar Bus Booking - Backend Setup Guide

## Overview
This is the Node.js backend for the Jambostar bus booking application with M-Pesa payment integration using the Daraja API.

---

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- M-Pesa Daraja API credentials (sandbox or production)

---

## Installation Steps

### 1. Extract and Navigate to the Backend Directory
```bash
cd /path/to/your/project
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- **express**: Web framework
- **axios**: HTTP client for M-Pesa API calls
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing support
- **body-parser**: JSON parsing middleware
- **nodemon**: Auto-reload during development (dev only)

### 3. Configure Environment Variables (.env file)
The `.env` file is already created with placeholder values. You need to update it with your M-Pesa credentials.

#### How to Get M-Pesa Daraja API Credentials:

1. **Go to Safaricom Daraja** (https://developer.safaricom.co.ke/)
2. **Register/Login** with your account
3. **Create a New App** and select the following APIs:
   - STK Push
   - C2B/Payment Integration
4. **Copy your credentials:**
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - Business Short Code (default: 174379 for sandbox)
   - Passkey (provided by Safaricom)

5. **Update `.env` file:**
```env
MPESA_CONSUMER_KEY=your_actual_consumer_key
MPESA_CONSUMER_SECRET=your_actual_consumer_secret
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=your_actual_passkey
CALLBACK_URL=http://localhost:3000/callback
MPESA_ENV=sandbox
PORT=3000
```

---

## Running the Backend

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

You should see:
```
✅ Jambostar Backend running on http://localhost:3000
M-Pesa Environment: sandbox
```

---

## API Endpoints

### 1. STK Push (Mobile Payment Prompt)
**POST** `/stkpush`

**Request Body:**
```json
{
  "phone": "254712345678",
  "amount": 200
}
```

**Response (Success):**
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "STK Push sent successfully",
  "CheckoutRequestID": "ws_CO_DMZ_12345"
}
```

**Response (Error):**
```json
{
  "ResponseCode": "1",
  "ResponseDescription": "Invalid phone number or amount"
}
```

### 2. Payment Callback
**POST** `/callback`
- M-Pesa sends payment confirmation to this endpoint
- Logs the transaction details
- Automatically returns 200 to M-Pesa

### 3. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2026-02-17T10:30:45.123Z"
}
```

---

## Linking Frontend with Backend

The frontend is already configured to communicate with the backend. Here's what's happening:

### In `some.html` (Frontend):
```javascript
const response = await fetch('http://localhost:3000/stkpush', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, amount })
});
```

### How it works:
1. User fills in: Phone number, amount, and booking details
2. User clicks "PAY & GENERATE TICKET"
3. Frontend sends POST request to backend `/stkpush` endpoint
4. Backend initiates M-Pesa STK Push
5. User's phone shows M-Pesa prompt
6. User enters PIN to complete payment
7. M-Pesa sends callback to backend
8. Booking is confirmed and ticket is generated

---

## Complete Workflow in Order

### Step 1: Terminal 1 - Start Backend
```bash
npm install
npm start
```
Wait for: `✅ Jambostar Backend running on http://localhost:3000`

### Step 2: Open Frontend
- Open `some.html` in your web browser
- Or serve it locally with:
  ```bash
  # Using Python
  python -m http.server 8000
  
  # Using Node.js (http-server)
  npm install -g http-server
  http-server
  ```

### Step 3: Test the Booking
1. Select a travel date
2. Choose a route
3. Select seats
4. Enter your phone number (format: 254XXXXXXXXX)
5. Enter your full name
6. Click "PAY & GENERATE TICKET"
7. A payment prompt will be sent to your M-Pesa account
8. Complete the payment on your phone
9. Ticket is generated automatically

---

## Environment Setup by Stage

### For Development (Testing)
```env
MPESA_ENV=sandbox
PORT=3000
CALLBACK_URL=http://localhost:3000/callback
```

### For Production (Live)
```env
MPESA_ENV=production
PORT=3000
CALLBACK_URL=https://yourdomain.com/callback
```

Update `CONSUMER_KEY` and `CONSUMER_SECRET` for production.

---

## Troubleshooting

### Issue: "Server Error - Is your Node.js backend running?"
- Make sure backend is running on port 3000
- Check if Node.js is installed: `node --version`

### Issue: "STK Push failed"
- Verify `.env` credentials are correct
- Check if you're in sandbox mode (for testing)
- Ensure phone number format is correct (254XXXXXXXXX)

### Issue: "Module not found"
- Run `npm install` again
- Delete `node_modules` folder and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

### Issue: "CORS errors"
- CORS is already enabled in the backend
- Ensure frontend is accessing `http://localhost:3000/stkpush`

### View Logs
Check the terminal running the backend for detailed logs of all requests and responses.

---

## File Structure
```
your-project/
├── some.html          (Frontend)
├── server.js          (Backend main file)
├── package.json       (Dependencies)
├── .env               (Configuration - do not commit)
├── .env.example       (Template for .env)
└── README.md          (This file)
```

---

## Security Notes

⚠️ **Important:**
1. Never commit `.env` file to Git (add to `.gitignore`)
2. Keep `CONSUMER_KEY` and `CONSUMER_SECRET` private
3. Use HTTPS in production (not HTTP)
4. Validate all inputs on the backend
5. Store booking data securely (currently using localStorage)

---

## Next Steps

1. **Get real M-Pesa credentials** from Daraja
2. **Test thoroughly** in sandbox mode
3. **Deploy to a server** (Heroku, AWS, Digital Ocean, etc.)
4. **Update callback URL** in production
5. **Switch to production mode** when ready

---

## Support

For M-Pesa API issues:
- Visit: https://developer.safaricom.co.ke/
- Check API documentation
- Test with their sandbox credentials

For general Node.js issues:
- Check Node.js documentation
- View server logs for detailed errors

---

Good luck with your Jambostar booking system! 🚌✨
