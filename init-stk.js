#!/usr/bin/env node

/**
 * Jambostar STK Push Initialization Script
 * Verifies M-Pesa credentials and tests STK Push functionality
 * 
 * Usage: node init-stk.js
 */

const fs = require('fs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    success: `${COLORS.green}✓${COLORS.reset}`,
    error: `${COLORS.red}✗${COLORS.reset}`,
    warning: `${COLORS.yellow}⚠${COLORS.reset}`,
    info: `${COLORS.blue}ℹ${COLORS.reset}`,
    step: `${COLORS.cyan}→${COLORS.reset}`,
  };
  console.log(`${prefix[type]} [${timestamp}] ${message}`);
}

async function checkDependencies() {
  log('step', 'Checking dependencies...');
  
  const required = ['express', 'axios', 'dotenv', 'cors', 'body-parser'];
  const packageJson = require('./package.json');
  const installed = Object.keys(packageJson.dependencies);
  
  let allPresent = true;
  required.forEach(dep => {
    if (installed.includes(dep)) {
      log('success', `${dep} is installed`);
    } else {
      log('error', `${dep} is missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

function checkEnvironmentVariables() {
  log('step', 'Checking environment variables...');
  
  const required = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORT_CODE',
    'MPESA_PASSKEY',
    'CALLBACK_URL',
    'MPESA_ENV',
  ];
  
  let allPresent = true;
  required.forEach(key => {
    const value = process.env[key];
    if (value && value !== `your_${key.toLowerCase()}_here` && value !== `your_consumer_key_here`) {
      log('success', `${key} is set`);
    } else {
      log('warning', `${key} needs to be configured`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

async function testM_PesaConnection() {
  log('step', 'Testing M-Pesa API connection...');
  
  try {
    const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
    const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
    const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
    
    if (!CONSUMER_KEY || !CONSUMER_SECRET || CONSUMER_KEY.includes('your_')) {
      log('warning', 'M-Pesa credentials not configured, skipping connection test');
      return false;
    }
    
    const AUTH_URL = `https://${MPESA_ENV === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke'}/oauth/v1/generate?grant_type=client_credentials`;
    
    const credentialsBase64 = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(AUTH_URL, {
      headers: {
        Authorization: `Basic ${credentialsBase64}`,
      },
      timeout: 10000,
    });
    
    if (response.data.access_token) {
      log('success', 'M-Pesa connection successful');
      log('info', `Environment: ${MPESA_ENV}`);
      return true;
    }
  } catch (error) {
    log('error', `M-Pesa connection failed: ${error.message}`);
    return false;
  }
}

function checkFiles() {
  log('step', 'Checking required files...');
  
  const required = [
    'server.js',
    'some.html',
    'package.json',
    'test-api.js',
  ];
  
  let allPresent = true;
  required.forEach(file => {
    if (fs.existsSync(file)) {
      log('success', `${file} exists`);
    } else {
      log('error', `${file} not found`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

function validateConfiguration() {
  log('step', 'Validating configuration...');
  
  const config = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortCode: process.env.MPESA_SHORT_CODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.CALLBACK_URL,
    env: process.env.MPESA_ENV || 'sandbox',
    port: process.env.PORT || 3000,
  };
  
  let isValid = true;
  
  // Check Consumer Key/Secret
  if (!config.consumerKey || config.consumerKey.includes('your_')) {
    log('error', 'Consumer Key is not configured');
    isValid = false;
  }
  
  if (!config.consumerSecret || config.consumerSecret.includes('your_')) {
    log('error', 'Consumer Secret is not configured');
    isValid = false;
  }
  
  // Check Short Code
  if (!config.shortCode) {
    log('error', 'Short Code is not set');
    isValid = false;
  }
  
  // Check Passkey
  if (!config.passkey || config.passkey.includes('your_')) {
    log('error', 'Passkey is not configured');
    isValid = false;
  }
  
  // Check Callback URL
  if (!config.callbackUrl) {
    log('error', 'Callback URL is not set');
    isValid = false;
  }
  
  if (!config.callbackUrl.startsWith('http')) {
    log('error', 'Callback URL must start with http or https');
    isValid = false;
  }
  
  // Check Environment
  if (!['sandbox', 'production'].includes(config.env)) {
    log('error', `Invalid environment: ${config.env}. Must be 'sandbox' or 'production'`);
    isValid = false;
  }
  
  if (isValid) {
    log('success', 'Configuration is valid');
    console.log('\n📋 Current Configuration:');
    console.log(`   Short Code: ${config.shortCode}`);
    console.log(`   Environment: ${config.env}`);
    console.log(`   Callback URL: ${config.callbackUrl}`);
    console.log(`   Port: ${config.port}\n`);
  }
  
  return isValid;
}

async function runInitialization() {
  console.log('\n' + COLORS.cyan + '╔═══════════════════════════════════════════════════╗' + COLORS.reset);
  console.log(COLORS.cyan + '║     Jambostar STK Push Initialization              ║' + COLORS.reset);
  console.log(COLORS.cyan + '╚═══════════════════════════════════════════════════╝\n' + COLORS.reset);
  
  let successful = true;
  
  // Step 1: Check Dependencies
  const depsOk = await checkDependencies();
  if (!depsOk) {
    log('error', 'Missing dependencies. Run: npm install');
    successful = false;
  }
  
  // Step 2: Check Files
  console.log('');
  const filesOk = checkFiles();
  if (!filesOk) {
    log('error', 'Missing required files');
    successful = false;
  }
  
  // Step 3: Check Environment Variables
  console.log('');
  const envOk = checkEnvironmentVariables();
  
  // Step 4: Validate Configuration
  console.log('');
  const configOk = validateConfiguration();
  if (!configOk) {
    successful = false;
  }
  
  // Step 5: Test M-Pesa Connection
  console.log('');
  const mpesaOk = await testM_PesaConnection();
  
  // Summary
  console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════' + COLORS.reset);
  
  if (successful && configOk) {
    console.log(COLORS.green + '✓ Initialization Complete!' + COLORS.reset);
    console.log('\n📝 Next Steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Run tests: node test-api.js');
    console.log('   3. Open browser: http://localhost:3000\n');
  } else {
    console.log(COLORS.red + '✗ Initialization Incomplete' + COLORS.reset);
    console.log('\n📝 Issues to fix:');
    if (!depsOk) console.log('   • Run: npm install');
    if (!filesOk) console.log('   • Check if all required files exist');
    if (!configOk) console.log('   • Update .env file with valid credentials');
    if (!mpesaOk && configOk) console.log('   • Verify M-Pesa credentials are correct\n');
  }
  
  console.log(COLORS.cyan + '═══════════════════════════════════════════════════\n' + COLORS.reset);
  
  process.exit(successful && configOk ? 0 : 1);
}

// Run initialization
runInitialization().catch(error => {
  log('error', `Unexpected error: ${error.message}`);
  process.exit(1);
});
