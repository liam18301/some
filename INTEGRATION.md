# Frontend-Backend Integration Guide

## How the Frontend and Backend Communicate

Your application uses a simple **REST API** architecture:
- **Frontend** (`some.html`): Sends HTTP requests to the backend
- **Backend** (`server.js`): Receives requests, processes them, and returns responses

---

## Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                      (some.html frontend)                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ 1. User fills booking form
                              │ 2. Clicks "PAY & GENERATE TICKET"
                              │
                              ▼
                   ┌──────────────────────┐
                   │  JavaScript Event    │
                   │  handleBookingSubmit │
                   └──────────────────────┘
                              │
                              │ 3. Sends POST request
                              │    (phone, amount)
                              │
                              ▼
                   ┌──────────────────────────────────┐
                   │   Node.js Backend                │
                   │   (server.js)                    │
                   │   Running on port 3000           │
                   │                                  │
                   │   /stkpush endpoint              │
                   └──────────────────────────────────┘
                              │
                              │ 4. Backend talks to M-Pesa
                              │
                              ▼
                   ┌──────────────────────────────────┐
                   │  M-Pesa Daraja API               │
                   │  (Payment Gateway)               │
                   └──────────────────────────────────┘
                              │
                              │ 5. Returns response
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         USER PHONE                              │
│                    (M-Pesa Prompt Appears)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Integration Setup

### Phase 1: Backend Setup (One-time)

#### Step 1.1: Open Terminal
```bash
cd /home/allan-kariuki/Downloads/s
```

#### Step 1.2: Install Dependencies
```bash
npm install
```

Wait for completion. You'll see:
```
added XX packages
```

#### Step 1.3: Configure M-Pesa Credentials
Edit `.env` file and update with your Daraja credentials:
```env
MPESA_CONSUMER_KEY=your_key_from_daraja
MPESA_CONSUMER_SECRET=your_secret_from_daraja
```

#### Step 1.4: Start Backend Server
```bash
npm start
```

You should see:
```
✅ Jambostar Backend running on http://localhost:3000
M-Pesa Environment: sandbox
```

**Leave this terminal running!** ← IMPORTANT

---

### Phase 2: Frontend Integration (Already Done!)

Your `some.html` already has the correct integration code:

```javascript
// Line 125-144 in some.html
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const phone = document.getElementById('phoneNumber').value;
    const amount = selectedSeats.length * parseInt(
        document.getElementById('routeSelect').value
    );
    
    // Send to backend
    const response = await fetch('http://localhost:3000/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount })
    });
    
    const result = await response.json();
    
    if (result.ResponseCode === "0") {
        alert("M-Pesa Prompt sent! Please enter your PIN.");
        confirmBooking();
    }
}
```

---

### Phase 3: Test the Integration

#### Step 3.1: Open Frontend
Open `some.html` in your web browser:
- Option A: Double-click the file
- Option B: Use Python server:
  ```bash
  python -m http.server 8000
  # Then open: http://localhost:8000/some.html
  ```

#### Step 3.2: Make a Test Booking
1. Select a travel date
2. Choose a route (Athi ➔ Syokimau or Athi ➔ Nairobi)
3. Click on seats to select them (up to 5)
4. Enter phone number: `254712345678` (sandbox test number)
5. Enter your name: `Test User`
6. Click "PAY & GENERATE TICKET"

#### Step 3.3: Monitor Backend
Check the terminal running `npm start`. You should see:
```
STK Push Response: {
  ResponseCode: '0',
  RequestId: 'ws_CO_xxx',
  CheckoutRequestID: 'ws_CO_xxx',
  ResponseDescription: 'Success'
}
```

#### Step 3.4: Verify Payment
- In sandbox mode: M-Pesa will send a test payment
- In production: Real payment is processed

---

## Complete Command Sequence

Run these commands in order:

### Terminal 1: Backend
```bash
cd /home/allan-kariuki/Downloads/s
npm install
npm start
```

### Terminal 2: Frontend (Optional - only if not opening file directly)
```bash
cd /home/allan-kariuki/Downloads/s
python -m http.server 8000
```

Then open browser:
```
http://localhost:8000/some.html
```

---

## API Communication Details

### Request 1: Frontend → Backend
**Frontend Code:**
```javascript
fetch('http://localhost:3000/stkpush', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, amount })
})
```

**Sends:**
```json
POST /stkpush HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "phone": "254712345678",
  "amount": 150
}
```

### Response 1: Backend → Frontend
**Backend Code (server.js):**
```javascript
res.json({
  ResponseCode: "0",
  ResponseDescription: "STK Push sent successfully",
  CheckoutRequestID: "ws_CO_xxx"
});
```

**Returns:**
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "STK Push sent successfully",
  "CheckoutRequestID": "ws_CO_xxx"
}
```

### Request 2: M-Pesa → Backend (Callback)
After user completes payment, M-Pesa sends:
```json
POST /callback HTTP/1.1

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "xxx",
      "CheckoutRequestID": "ws_CO_xxx",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully"
    }
  }
}
```

---

## Troubleshooting Integration

### Problem: "Cannot connect to backend"

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3000/health

# If error, restart with:
npm start
```

### Problem: "M-Pesa Prompt sent" but no prompt appears

**Causes:**
- Invalid phone number format
- Missing M-Pesa credentials in .env
- Not in sandbox/production environment

**Solution:**
1. Check `.env` file has valid credentials
2. Verify phone format: `254XXXXXXXXX`
3. Check backend terminal for error logs

### Problem: "CORS error"

**Error message:**
```
Access to XMLHttpRequest at 'http://localhost:3000...' 
from origin 'http://localhost:8000' blocked by CORS policy
```

**Solution:**
CORS is already enabled! Make sure:
- Backend is running (`npm start`)
- Using correct endpoint: `http://localhost:3000/stkpush`
- Method is POST, content type is application/json

### Problem: "Network Error"

**Solution:**
```bash
# Verify backend is running
curl http://localhost:3000/health

# You should see:
# {"status":"Server is running","timestamp":"2026-02-17T..."}

# If not, check if port 3000 is in use
lsof -i :3000

# If occupied, either:
# 1. Kill process: kill -9 <PID>
# 2. Change PORT in .env
```

---

## Files and Their Roles

| File | Role | Purpose |
|------|------|---------|
| `some.html` | Frontend | User interface, handles form submission |
| `server.js` | Backend | Processes requests, talks to M-Pesa API |
| `package.json` | Config | Defines dependencies (express, axios, etc.) |
| `.env` | Config | Stores M-Pesa credentials (PRIVATE!) |
| `test-api.js` | Testing | Test backend endpoints |

---

## URL Reference

- **Frontend:** `http://localhost:8000/some.html` (or just open file)
- **Backend:** `http://localhost:3000`
- **Backend Health Check:** `http://localhost:3000/health`
- **STK Push Endpoint:** `POST http://localhost:3000/stkpush`
- **M-Pesa Daraja:** `https://developer.safaricom.co.ke/`

---

## Environment Variables Impact

```env
MPESA_ENV=sandbox     ← For testing, uses test credentials
MPESA_ENV=production  ← For live, uses real M-Pesa payments

PORT=3000            ← Backend listens on http://localhost:3000
CALLBACK_URL         ← Where M-Pesa sends responses
```

---

## Common Commands

```bash
# Start backend
npm start

# Start with auto-reload (development)
npm run dev

# Test APIs without frontend
node test-api.js

# Test with curl
curl -X POST http://localhost:3000/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone":"254712345678","amount":150}'

# Check if backend is running
curl http://localhost:3000/health
```

---

## Summary

✅ **Frontend** → `some.html` sends request to backend  
✅ **Backend** → `server.js` listens on port 3000  
✅ **M-Pesa** → Receives payment, sends callback  
✅ **Flow** → Frontend → Backend → M-Pesa → Callback → Frontend  

You're all set! Start the backend and test the booking system. 🎉
