#!/usr/bin/env node

/**
 * Jambostar STK Push - Complete Examples & Testing Guide
 * 
 * This file contains all the ways to test STK Push
 */

const http = require('http');
const https = require('https');

const API_URL = 'http://localhost:3000';

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║    JAMBOSTAR STK PUSH - TESTING GUIDE                ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log('📋 BEFORE YOU START:');
console.log('─────────────────────');
console.log('1. ✓ Server running on http://localhost:3000');
console.log('2. ✓ .env file has valid M-Pesa credentials');
console.log('3. ⚠ CALLBACK_URL in .env must be a PUBLIC URL');
console.log('   → Use webhook.site: https://webhook.site');
console.log('   → Copy your unique URL and update .env\n');

// Example 1: Simple Test with curl
console.log('\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 1: TEST WITH CURL');
console.log('═══════════════════════════════════════════════════\n');

console.log('Run this command in your terminal:\n');
console.log('  curl -X POST http://localhost:3000/stkpush \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'{');
console.log('      "phone": "254712345678",');
console.log('      "amount": 200');
console.log('    }\'');

console.log('\n✓ For a REAL transaction, replace:');
console.log('  • "254712345678" with your actual M-Pesa registered phone');
console.log('  • "200" with the amount in KES');

// Example 2: Using Node.js HTTP
console.log('\n\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 2: PROGRAMMATIC (Node.js)');
console.log('═══════════════════════════════════════════════════\n');

async function stkPushExample() {
  const payload = {
    phone: '254712345678',
    amount: 200
  };

  console.log('// JavaScript Code:');
  console.log('const response = await fetch("http://localhost:3000/stkpush", {');
  console.log('  method: "POST",');
  console.log('  headers: { "Content-Type": "application/json" },');
  console.log('  body: JSON.stringify({');
  console.log('    phone: "254712345678",  // 254 + 10 digits');
  console.log('    amount: 200              // Amount in KES');
  console.log('  })');
  console.log('});');
  console.log('');
  console.log('const result = await response.json();');
  console.log('console.log(result);');
}

stkPushExample();

// Example 3: Test Cases
console.log('\n\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 3:TEST CASES (All Scenarios)');
console.log('═══════════════════════════════════════════════════\n');

const testCases = [
  {
    name: '✓ VALID REQUEST',
    phone: '254712345678',
    amount: 200,
    expected: 'STK Push sent - M-Pesa prompt on user phone'
  },
  {
    name: '❌ Invalid Phone Format',
    phone: '0712345678',
    amount: 200,
    expected: 'Error: Phone must start with 254 and be 12 digits'
  },
  {
    name: '❌ Amount Too Low',
    phone: '254712345678',
    amount: 0.5,
    expected: 'Error: Amount must be at least 1 KES'
  },
  {
    name: '❌ Missing Phone',
    phone: '',
    amount: 200,
    expected: 'Error: Invalid phone number or amount'
  },
  {
    name: '❌ Missing Amount',
    phone: '254712345678',
    amount: null,
    expected: 'Error: Invalid phone number or amount'
  },
];

testCases.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  console.log(`  Phone:    "${test.phone}"`);
  console.log(`  Amount:   ${test.amount}`);
  console.log(`  Expected: ${test.expected}`);
  console.log('');
});

// Example 4: Real-World Workflow
console.log('\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 4: REAL-WORLD WORKFLOW');
console.log('═══════════════════════════════════════════════════\n');

console.log('STEP 1: User Inputs (from HTML form)');
console.log('  • Phone:      254712345678 (M-Pesa registered)');
console.log('  • Amount:     2 seats × Ksh 200 = Ksh 400');
console.log('');

console.log('STEP 2: Frontend sends request');
console.log('  POST http://localhost:3000/stkpush');
console.log('  Body: { phone: "254712345678", amount: 400 }');
console.log('');

console.log('STEP 3: Backend interactions');
console.log('  ① Gets M-Pesa API token');
console.log('  ② Creates STK Push request');
console.log('  ③ Sends to M-Pesa sandbox API');
console.log('');

console.log('STEP 4: M-Pesa Response (Sandbox)');
console.log('  ✓ ResponseCode: "0" (Success)');
console.log('  ✓ CheckoutRequestID: "ws_CO_....."');
console.log('  → M-Pesa prompt appears on user phone');
console.log('');

console.log('STEP 5: User Completes Transaction');
console.log('  ① User enters M-Pesa PIN on phone');
console.log('  ② M-Pesa processes payment');
console.log('  ③ M-Pesa sends callback to your CALLBACK_URL');
console.log('  ④ Backend receives confirmation');
console.log('  ⑤ Booking is confirmed');
console.log('');

console.log('STEP 6: Receipt Generated');
console.log('  ✓ Ticket printed/saved');
console.log('  ✓ Booking recorded in localStorage');
console.log('');

// Example 5: Error Handling
console.log('\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 5: ERROR HANDLING');
console.log('═══════════════════════════════════════════════════\n');

console.log('// Handle STK Push Errors:');
console.log('');
console.log('try {');
console.log('  const res = await fetch(\'http://localhost:3000/stkpush\', {');
console.log('    method: \'POST\',');
console.log('    headers: { \'Content-Type\': \'application/json\' },');
console.log('    body: JSON.stringify({ phone, amount })');
console.log('  });');
console.log('');
console.log('  const data = await res.json();');
console.log('');
console.log('  if (data.ResponseCode === "0") {');
console.log('    // ✓ Success - M-Pesa prompt sent');
console.log('    alert("Check your phone for M-Pesa prompt");');
console.log('  } else {');
console.log('    // ❌ Failed');
console.log('    alert("Error: " + data.ResponseDescription);');
console.log('  }');
console.log('} catch (error) {');
console.log('  alert("Server Error: " + error.message);');
console.log('}');

// Example 6: M-Pesa Response Examples
console.log('\n\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 6: M-PESA RESPONSES');
console.log('═══════════════════════════════════════════════════\n');

console.log('✓ SUCCESS RESPONSE:');
console.log('─────────────────');
console.log('{');
console.log('  "ResponseCode": "0",');
console.log('  "ResponseDescription": "STK Push sent successfully",');
console.log('  "CheckoutRequestID": "ws_CO_DMZ_..."');
console.log('}');
console.log('');

console.log('❌ ERROR RESPONSE (Bad Callback URL):');
console.log('─────────────────────────────────────');
console.log('{');
console.log('  "ResponseCode": "1",');
console.log('  "ResponseDescription": "Bad Request - Invalid CallBackURL",');
console.log('  "errorDetails": "errorCode: 400.002.02"');
console.log('}');
console.log('');

console.log('❌ ERROR RESPONSE (Bad Credentials):');
console.log('────────────────────────────────────');
console.log('{');
console.log('  "ResponseCode": "1",');
console.log('  "ResponseDescription": "400 Unauthorized",');
console.log('  "errorDetails": "Invalid credentials"');
console.log('}');
console.log('');

console.log('❌ ERROR RESPONSE (Invalid Phone):');
console.log('──────────────────────────────────');
console.log('{');
console.log('  "ResponseCode": "1",');
console.log('  "ResponseDescription": "Phone must be in format 254XXXXXXXXX (12 digits)"');
console.log('}');

// Example 7: Testing Steps
console.log('\n\n═══════════════════════════════════════════════════');
console.log('EXAMPLE 7: STEP-BY-STEP TESTING');
console.log('═══════════════════════════════════════════════════\n');

console.log('✅ SETUP (One-time):');
console.log('   1. Go to https://webhook.site');
console.log('   2. Copy your unique URL');
console.log('   3. Update .env: CALLBACK_URL=https://webhook.site/YOUR_ID/callback');
console.log('   4. Restart server: npm start');
console.log('');

console.log('✅ TEST VIA BROWSER:');
console.log('   1. Go to http://localhost:3000');
console.log('   2. Select seats');
console.log('   3. Enter phone: 254712345678');
console.log('   4. Click "PAY & GENERATE TICKET"');
console.log('   5. Check browser alert for response');
console.log('');

console.log('✅ TEST VIA CURL:');
console.log('   1. Open terminal');
console.log('   2. Run: curl -X POST http://localhost:3000/stkpush \\');
console.log('            -H "Content-Type: application/json" \\');
console.log('            -d \'{"phone":"254712345678", "amount":200}\'');
console.log('   3. Look for ResponseCode: "0"');
console.log('');

console.log('✅ CHECK CALLBACK:');
console.log('   1. Go to https://webhook.site');
console.log('   2. Refresh the page');
console.log('   3. You should see M-Pesa callback data');
console.log('');

// Final Tips
console.log('\n═══════════════════════════════════════════════════');
console.log('⚡ QUICK TIPS');
console.log('═══════════════════════════════════════════════════\n');

console.log('🎯 Phone Number Format:');
console.log('   ✓ 254712345678 (correct)');
console.log('   ✗ 0712345678 (missing 254)');
console.log('   ✗ +254712345678 (has +)');
console.log('   ✗ 254-712-345-678 (has dashes)');
console.log('');

console.log('💰 Amount Validation:');
console.log('   ✓ 1 - 10,000 (sandbox testing range)');
console.log('   ✗ 0 (too low)');
console.log('   ✗ -50 (negative)');
console.log('');

console.log('🔧 Debugging:');
console.log('   1. Check terminal logs when sending request');
console.log('   2. Look for "STK Push Request Received" message');
console.log('   3. Check "Phone format" validation');
console.log('   4. Check "M-Pesa connection" success/failure');
console.log('');

console.log('📲 Testing Numbers:');
console.log('   • Any number starting with 254 works in sandbox');
console.log('   • Try: 254712345678, 254701234567, 254797114211');
console.log('');

console.log('═══════════════════════════════════════════════════\n');

console.log('Ready to test? 🚀');
console.log('');
console.log('Questions? Check the terminal logs while making requests!');
console.log('');
