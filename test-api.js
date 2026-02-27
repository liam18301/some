/**
 * Jambostar Backend API Test Script
 * Run with: node test-api.js
 */

const http = require('http');

const API_URL = 'http://localhost:3000';

// Test data
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    endpoint: '/health',
    body: null,
  },
  {
    name: 'STK Push - Valid Request',
    method: 'POST',
    endpoint: '/stkpush',
    body: { phone: '254712345678', amount: 200 },
  },
  {
    name: 'STK Push - Invalid Phone Format',
    method: 'POST',
    endpoint: '/stkpush',
    body: { phone: '0712345678', amount: 200 },
  },
  {
    name: 'STK Push - Invalid Amount',
    method: 'POST',
    endpoint: '/stkpush',
    body: { phone: '254712345678', amount: -50 },
  },
  {
    name: 'STK Push - Missing Amount',
    method: 'POST',
    endpoint: '/stkpush',
    body: { phone: '254712345678' },
  },
];

// Function to make HTTP requests
function makeRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('\n🧪 Jambostar Backend API Tests\n');
  console.log('Make sure your backend is running with: npm start\n');
  console.log('=' .repeat(60));

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n📝 Test ${i + 1}: ${test.name}`);
    console.log(`Method: ${test.method} ${test.endpoint}`);

    if (test.body) {
      console.log(`Body: ${JSON.stringify(test.body)}`);
    }

    try {
      const result = await makeRequest(test.method, test.endpoint, test.body);
      console.log(`Status: ${result.status}`);
      
      try {
        const parsed = JSON.parse(result.body);
        console.log('Response:', JSON.stringify(parsed, null, 2));
      } catch {
        console.log('Response:', result.body);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      console.log(
        '\n⚠️  Make sure the backend is running!'
      );
      console.log('Start it with: npm start\n');
      process.exit(1);
    }

    console.log('-'.repeat(60));
  }

  console.log('\n✅ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
