const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files and HTML
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'some.html'));
});

// M-Pesa Credentials (from .env file)
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORT_CODE = process.env.MPESA_SHORT_CODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // 'sandbox' or 'production'

// M-Pesa API URLs
const AUTH_URL = `https://${MPESA_ENV === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke'}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `https://${MPESA_ENV === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke'}/mpesa/stkpush/v1/processrequest`;

// Get M-Pesa Access Token
async function getMpesaToken() {
  try {
    const credentialsBase64 = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(AUTH_URL, {
      headers: {
        Authorization: `Basic ${credentialsBase64}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

// Generate STK Push Timestamp
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate Password for STK Push
function generatePassword(shortCode, passkey, timestamp) {
  const str = shortCode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
}

// STK Push Endpoint
app.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    
    console.log('\n🔍 STK Push Request Received:');
    console.log(`   Phone: ${phone}`);
    console.log(`   Amount: ${amount}`);

    // Validate input
    if (!phone || !amount || amount <= 0) {
      console.log('❌ Validation failed: Missing phone or invalid amount');
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Invalid phone number or amount',
      });
    }

    // Phone format validation (should be 254XXXXXXXXX)
    if (!phone.startsWith('254') || phone.length !== 12) {
      console.log(`❌ Phone format invalid: "${phone}" (length: ${phone.length}). Expected: 254XXXXXXXXX`);
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Phone must be in format 254XXXXXXXXX (12 digits)',
      });
    }

    // Amount should be at least 1 KES
    if (amount < 1) {
      console.log('❌ Amount must be at least 1 KES');
      return res.status(400).json({
        ResponseCode: '1',
        ResponseDescription: 'Amount must be at least 1 KES',
      });
    }

    console.log('✓ Validation passed');
    
    // Get access token
    const accessToken = await getMpesaToken();
    console.log('✓ Access token obtained');

    // Generate timestamp and password
    const timestamp = getTimestamp();
    const password = generatePassword(BUSINESS_SHORT_CODE, PASSKEY, timestamp);

    // Prepare STK Push request
    const stkPushRequest = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // Ensure amount is an integer
      PartyA: phone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'JambostarBuses',
      TransactionDesc: 'Bus Booking Payment',
    };

    // Send STK Push request to M-Pesa
    const response = await axios.post(STK_PUSH_URL, stkPushRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('STK Push Response:', response.data);

    // Return response to frontend
    return res.json({
      ResponseCode: response.data.ResponseCode || '0',
      ResponseDescription: response.data.ResponseDescription || 'STK Push sent successfully',
      CheckoutRequestID: response.data.CheckoutRequestID,
    });
  } catch (error) {
    console.error('\n❌ STK Push Error Details:');
    console.error('   Error Message:', error.message);
    if (error.response?.data) {
      console.error('   M-Pesa Response:', error.response.data);
    } else if (error.response?.status) {
      console.error('   HTTP Status:', error.response.status);
    }
    console.error('   Full Error:', error);
    
    return res.status(500).json({
      ResponseCode: '1',
      ResponseDescription: error.response?.data?.errorDescription || error.message || 'Failed to process payment',
      errorDetails: error.message,
    });
  }
});

// Callback endpoint (M-Pesa will send payment confirmation here)
app.post('/callback', (req, res) => {
  try {
    console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2));
    
    const callbackData = req.body.Body.stkCallback;

    if (callbackData.ResultCode === 0) {
      console.log('Payment successful:', callbackData);
      // Handle successful payment
      // Update your database here
    } else {
      console.log('Payment failed:', callbackData);
      // Handle failed payment
    }

    // Always respond with 200 to M-Pesa
    res.json({ success: true });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    ResponseCode: '1',
    ResponseDescription: 'Server error',
    error: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Jambostar Backend running on http://localhost:${PORT}`);
  console.log(`M-Pesa Environment: ${MPESA_ENV}`);
  console.log('Check .env file to ensure all credentials are set correctly');
});
