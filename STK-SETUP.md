# Jambostar STK Push - Complete Setup Guide

## Overview
STK Push (SIM Toolkit Push) is an M-Pesa feature that prompts users to enter their PIN for payment without redirecting to the M-Pesa app. This guide walks you through the complete initialization process.

---

## Prerequisites

- Node.js 14+ installed
- npm installed
- M-Pesa Daraja API account (https://developer.safaricom.co.ke/)
- A public callback URL (for production) or ngrok for local testing

---

## Step 1: Get M-Pesa Credentials

1. Go to https://developer.safaricom.co.ke/
2. Sign up or login to your account
3. Navigate to **My Apps** and create a new app
4. Select **Sandbox** environment
5. Get your credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - Keep your **Short Code** (default: 174379 for sandbox)
   - Keep your **Passkey** (provided by Safaricom)

---

## Step 2: Configure Environment Variables

Update `.env` file with your credentials:

```env
MPESA_CONSUMER_KEY=8Ox99GklN3p236tL83eYilWWTgeJ0UwkUTsWpcRWdYhSdluh
MPESA_CONSUMER_SECRET=dcRLUiWh7TsmlMDEpGaASRGT1BhnaFQCF22rq1lrBdLZKhc5eLdr8OkjCxhsq9kg
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
CALLBACK_URL=http://your-callback-url:3000/callback
MPESA_ENV=sandbox
PORT=3000
```

---

## Step 3: Install Dependencies

```bash
npm install
```

Expected packages:
- **express**: Web framework
- **axios**: HTTP client for API calls
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **body-parser**: Parse request bodies

---

## Step 4: Set Up Callback URL (For Testing)

### Option A: Local Testing with ngrok

1. Install ngrok: https://ngrok.com/download
2. Run ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the forwarding URL (e.g., `https://abc123.ngrok.io`)
4. Update `.env`:
   ```env
   CALLBACK_URL=https://abc123.ngrok.io/callback
   ```

### Option B: Production Deployment

Use your actual domain:
```env
CALLBACK_URL=https://yourdomain.com/callback
```

---

## Step 5: Start the Server

```bash
npm start
```

Expected output:
```
✅ Jambostar Backend running on http://localhost:3000
M-Pesa Environment: sandbox
Check .env file to ensure all credentials are set correctly
```

---

## Step 6: Test STK Push

### Option A: Run Automated Test Suite

```bash
node test-api.js
```

This will test:
- Health check
- Valid STK Push request
- Invalid phone format
- Invalid amount
- Missing parameters

### Option B: Manual Test with curl

```bash
curl -X POST http://localhost:3000/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone": "254712345678", "amount": 200}'
```

Expected successful response:
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "STK Push sent successfully",
  "CheckoutRequestID": "ws_CO_DMZ_..."
}
```

---

## Step 7: API Endpoints Reference

### 1. **Health Check**
Verify server is running
```
GET /health
```

Response:
```json
{
  "status": "Server is running",
  "timestamp": "2026-02-22T10:30:00.000Z"
}
```

### 2. **STK Push**
Initiate payment prompt
```
POST /stkpush
Content-Type: application/json

{
  "phone": "254712345678",
  "amount": 200
}
```

Response (Success):
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "STK Push sent successfully",
  "CheckoutRequestID": "ws_CO_DMZ..."
}
```

Response (Error):
```json
{
  "ResponseCode": "1",
  "ResponseDescription": "Invalid phone number or amount"
}
```

### 3. **Payment Callback**
M-Pesa sends payment confirmation to this endpoint
```
POST /callback
```

The callback will be automatically handled and logged.

---

## Validation Rules

### Phone Number
- Must start with `254` (Kenya country code)
- Must be exactly 12 digits
- Format: `254712345678`

### Amount
- Minimum: 1 KES
- Recommended: 1-10,000 KES
- Must be an integer

---

## Error Handling

| Error | Solution |
|-------|----------|
| `Invalid phone number or amount` | Check phone format (`254XXXXXXXXX`) and amount > 0 |
| `Failed to get M-Pesa access token` | Verify Consumer Key/Secret in `.env` |
| `Token expired` | Server will auto-refresh on next request |
| `Callback failed` | Ensure CALLBACK_URL is publicly accessible |

---

## Troubleshooting

### 1. **Server won't start**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### 2. **M-Pesa credentials error**
- Verify all fields in `.env` are correct
- Check https://developer.safaricom.co.ke/ for correct credentials
- Ensure no extra spaces in `.env` values

### 3. **Callback URL not receiving requests**
- Test with ngrok: `ngrok http 3000`
- Update CALLBACK_URL in `.env`
- Verify firewall allows HTTPS traffic

### 4. **Testing with Sandbox**
- Use test phone numbers provided by Safaricom
- Test amounts: 1-10,000 KES
- Responses appear instantly in sandbox

---

## Development vs Production

### Sandbox (Development)
```env
MPESA_ENV=sandbox
CALLBACK_URL=https://your-ngrok-url.ngrok.io/callback
```

### Production
```env
MPESA_ENV=production
CALLBACK_URL=https://yourdomain.com/callback
MPESA_CONSUMER_KEY=your_production_key
MPESA_CONSUMER_SECRET=your_production_secret
MPESA_SHORT_CODE=your_till_number
```

---

## Frontend Integration

The HTML file (`some.html`) automatically integrates with the backend:

1. User selects seats and enters phone number
2. Clicks "PAY & GENERATE TICKET"
3. Frontend sends POST to `/stkpush`
4. M-Pesa prompt appears on user's phone
5. User enters PIN
6. Booking is confirmed and receipt is generated

---

## Security Best Practices

✅ **Do:**
- Store credentials in `.env` (never commit to git)
- Use HTTPS in production
- Validate all inputs (already done in code)
- Verify callback signatures (add this for production)
- Use ngrok for local callback testing

❌ **Don't:**
- Commit `.env` file to Git
- Hardcode credentials in code
- Use production credentials in development
- Expose Consumer Secret publicly

---

## Next Steps

1. ✅ Update `.env` with real credentials
2. ✅ Run `npm install`
3. ✅ Start server with `npm start`
4. ✅ Test with `node test-api.js`
5. ✅ Deploy to production with proper HTTPS/callback setup

---

## Support Resources

- M-Pesa Daraja API Docs: https://developer.safaricom.co.ke/docs
- STK Push Documentation: https://developer.safaricom.co.ke/docs?shell#lipa-na-m-pesa-online
- ngrok Documentation: https://ngrok.com/docs

---

**Created:** February 22, 2026
**Status:** Ready for Testing
