# STK Push - Complete Setup & Testing Guide

## 🎯 What is STK Push?

STK Push is M-Pesa's way of prompting a user to enter their PIN for payment without redirecting them to the M-Pesa app. The user gets a prompt directly on their phone.

**Flow:**
```
User clicks PAY → Frontend sends request → Backend calls M-Pesa API 
→ M-Pesa sends prompt to user's phone → User enters PIN 
→ M-Pesa sends callback confirmation → Booking is complete ✓
```

---

## ✅ SETUP STEPS (Do These First!)

### Step 1: Get M-Pesa Credentials ✓ (Already Done)

Your `.env` file has:
- Consumer Key: `8Ox99GklN3p236tL83eYilWWTgeJ0UwkUTsWpcRWdYhSdluh`
- Consumer Secret: `dcRLUiWh7TsmlMDEpGaASRGT1BhnaFQCF22rq1lrBdLZKhc5eLdr8OkjCxhsq9kg`
- Short Code: `174379`
- Passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`

### Step 2: Get a Public Callback URL ⚠️ **YOU MUST DO THIS**

**Why?** M-Pesa needs a **publicly accessible URL** to send payment confirmations. `localhost:3000` doesn't work because it's local only.

**Solution:** Use **webhook.site** (free, takes 30 seconds):

1. Open: https://webhook.site
2. Copy the unique URL shown (looks like: `https://webhook.site/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`)
3. Save it somewhere safe

### Step 3: Update .env

Open your `.env` file and replace this line:

```env
CALLBACK_URL=https://webhook.site/your-unique-id-here/callback
```

With your actual webhook.site URL plus `/callback`. For example:

```env
CALLBACK_URL=https://webhook.site/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6/callback
```

### Step 4: Restart Server

```bash
npm start
```

You should see:
```
✅ Jambostar Backend running on http://localhost:3000
```

---

## 🚀 TESTING STK PUSH

### Test Method 1: Via Browser (Easy)

1. Open: http://localhost:3000
2. Fill in the form:
   - **Travel Date:** (auto-filled)
   - **Route:** Select any route
   - **Seats:** Click to select a few seats
   - **M-Pesa Number:** `254712345678` (test number)
   - **Full Name:** Your name
3. Click "PAY & GENERATE TICKET"
4. Check the browser alert for response
5. Open terminal to see detailed logs

**✓ Success Response:**
```
STK Push sent successfully
```

**❌ Common Errors:**
- `Bad Request - Invalid CallBackURL` → Update .env with correct webhook.site URL
- `Phone must be in format 254XXXXXXXXX` → Use `254712345678` format
- `401 Unauthorized` → Credentials are incorrect

---

### Test Method 2: Via curl (Command Line)

```bash
curl -X POST http://localhost:3000/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 200
  }'
```

**Expected successful response:**
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "STK Push sent successfully",
  "CheckoutRequestID": "ws_CO_DMZ_..."
}
```

**Error response (wrong phone):**
```json
{
  "ResponseCode": "1",
  "ResponseDescription": "Phone must be in format 254XXXXXXXXX (12 digits)"
}
```

---

### Test Method 3: Via JavaScript (Node.js)

```javascript
async function testSTKPush() {
  const response = await fetch('http://localhost:3000/stkpush', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '254712345678',
      amount: 200
    })
  });

  const result = await response.json();
  console.log('Response:', result);

  if (result.ResponseCode === '0') {
    console.log('✓ STK Push sent successfully');
  } else {
    console.log('❌ Error:', result.ResponseDescription);
  }
}

testSTKPush();
```

---

## 📊 Complete Working Example

Here's what happens when you test with **valid credentials**:

### Input:
```
Phone: 254712345678
Amount: 200
```

### Terminal Output (Backend):
```
🔍 STK Push Request Received:
   Phone: 254712345678
   Amount: 200
✓ Validation passed
✓ Access token obtained
STK Push Response: { ResponseCode: '0', ... }
```

### Expected Response:
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "STK Push sent successfully",
  "CheckoutRequestID": "ws_CO_DMZ_20260223094825_60f3ebb3e4"
}
```

### In Real Scenario:
1. M-Pesa sends prompt to `254712345678`
2. User enters PIN on their phone
3. M-Pesa sends callback to your webhook.site URL
4. Check https://webhook.site to see the confirmation
5. Booking is complete

---

## 🔍 PHONE NUMBER FORMATS

### ✓ Valid Formats for Testing:
- `254712345678` ← Most common
- `254701234567`
- `254797114211`
- `254722999888`

(Any number starting with `254` and 12 digits total work in sandbox)

### ❌ Invalid Formats:
- `0712345678` ← Missing `254`
- `712345678` ← Missing `254` and digit
- `+254712345678` ← Has `+` symbol
- `254-712-345-678` ← Has dashes
- `254 712 345 678` ← Has spaces

---

## 💰 AMOUNT VALIDATION

- **Minimum:** 1 KES
- **Maximum:** 10,000 KES (for sandbox testing)
- **Format:** Must be a number (integer or decimal)

### Examples:
- ✓ `200` → Valid
- ✓ `1` → Valid (minimum)
- ✓ `10000` → Valid (maximum for sandbox)
- ❌ `0` → Invalid (too low)
- ❌ `-50` → Invalid (negative)
- ❌ `"200"` → Invalid (must be number, not string)

---

## 🐛 DEBUGGING

### Check Terminal Logs

When you make a request, look for these in your terminal:

**✓ Good logs:**
```
🔍 STK Push Request Received:
   Phone: 254712345678
   Amount: 200
✓ Validation passed
✓ Access token obtained
STK Push Response: ...
```

**❌ Bad logs:**
```
❌ Phone format invalid: "0712345678" (length: 10)
   Expected: 254XXXXXXXXX
```

```
❌ STK Push Error Details:
   Error Message: Invalid CallBackURL
   M-Pesa Response: { errorCode: '400.002.02' }
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `Bad Request - Invalid CallBackURL` | CALLBACK_URL not public | Update .env with webhook.site URL |
| `Phone must be 254XXXXXXXXX` | Wrong phone format | Use `254712345678` |
| `401 Unauthorized` | Bad credentials | Check M-Pesa keys in .env |
| `Connection timeout` | Server not running | Run `npm start` |
| `Cannot reach server` | Wrong URL | Use `http://localhost:3000` |

---

## 📱 WEBHOOK.SITE - CHECKING CALLBACKS

After sending an STK Push request:

1. Go to https://webhook.site and find your unique URL
2. Refresh the page
3. You should see incoming webhook requests
4. Click on a request to see the full M-Pesa callback data

**Example callback data:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "...",
      "CheckoutRequestID": "...",
      "ResultCode": 0,
      "ResultDesc": "The service is successful.",
      "Amount": 200,
      "MpesaReceiptNumber": "...",
      "TransactionDate": 20260223094825,
      "PhoneNumber": 254712345678
    }
  }
}
```

---

## 🎓 LEARNING PATH

### Beginner:
1. ✓ Setup webhook.site callback URL
2. ✓ Test via browser
3. ✓ Check webhook.site for callbacks

### Intermediate:
1. ✓ Test via curl
2. ✓ Understand M-Pesa response codes
3. ✓ Handle different error scenarios

### Advanced:
1. ✓ Implement backend callback processing
2. ✓ Deploy with ngrok for production testing
3. ✓ Move to production M-Pesa (not sandbox)

---

## 🚀 PRODUCTION DEPLOYMENT

When you're ready for production:

1. Get **real M-Pesa credentials** (not sandbox)
2. Use **ngrok** or **your actual domain** as callback URL
3. Update `.env`:
   ```env
   MPESA_ENV=production
   MPESA_CONSUMER_KEY=<production-key>
   MPESA_CONSUMER_SECRET=<production-secret>
   CALLBACK_URL=https://yourdomain.com/callback
   ```
4. Redeploy and test

---

## 📞 SUPPORT

- **M-Pesa Docs:** https://developer.safaricom.co.ke/docs
- **webhook.site:** https://webhook.site
- **Check server logs:** Look at terminal output when testing

---

## ✨ YOU'RE READY!

Your Jambostar STK Push is now fully set up. Start testing:

1. Go to http://localhost:3000
2. Try the payment flow
3. Check webhook.site for callbacks
4. Look at terminal logs for debugging

**Happy booking! 🎫**
