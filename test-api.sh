#!/bin/bash

# Jambostar Backend API Testing Script
# This script helps you test the backend endpoints

echo "================================"
echo "Jambostar Backend API Tester"
echo "================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3000"

echo -e "${YELLOW}Make sure your backend is running!${NC}"
echo "Start it with: npm start"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "Endpoint: GET /health"
curl -X GET $API_URL/health
echo ""
echo ""

# Test 2: STK Push - Valid Request
echo -e "${YELLOW}Test 2: STK Push - Valid Request${NC}"
echo "Endpoint: POST /stkpush"
echo "Body: {\"phone\": \"254712345678\", \"amount\": 200}"
curl -X POST $API_URL/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone": "254712345678", "amount": 200}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""
echo ""

# Test 3: STK Push - Invalid Phone Format
echo -e "${YELLOW}Test 3: STK Push - Invalid Phone Format${NC}"
echo "Phone format must be 254XXXXXXXXX"
curl -X POST $API_URL/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone": "0712345678", "amount": 200}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""
echo ""

# Test 4: STK Push - Invalid Amount
echo -e "${YELLOW}Test 4: STK Push - Invalid Amount${NC}"
echo "Amount must be greater than 0"
curl -X POST $API_URL/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone": "254712345678", "amount": -50}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""
echo ""

# Test 5: STK Push - Missing Parameters
echo -e "${YELLOW}Test 5: STK Push - Missing Parameters${NC}"
echo "Testing with missing 'amount' parameter"
curl -X POST $API_URL/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone": "254712345678"}' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""
echo ""

echo -e "${GREEN}Testing Complete!${NC}"
echo ""
echo "Notes:"
echo "- For real M-Pesa testing, use valid Daraja credentials in .env"
echo "- Sandbox test number: 254712345678"
echo "- Check server logs for detailed responses"
