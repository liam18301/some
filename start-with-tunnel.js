#!/usr/bin/env node

/**
 * Jambostar Startup Script with Auto-Tunnel
 * This script automatically:
 * 1. Starts ngrok tunnel to localhost:3000
 * 2. Gets the public URL
 * 3. Updates .env with the ngrok URL
 * 4. Starts the Express server
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(type, message) {
  const prefix = {
    success: `${COLORS.green}✓${COLORS.reset}`,
    error: `${COLORS.red}✗${COLORS.reset}`,
    warning: `${COLORS.yellow}⚠${COLORS.reset}`,
    info: `${COLORS.blue}ℹ${COLORS.reset}`,
    step: `${COLORS.cyan}→${COLORS.reset}`,
    rocket: `${COLORS.magenta}🚀${COLORS.reset}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getNgrokUrl() {
  try {
    // Query ngrok API for the public URL
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    const data = await response.json();
    
    if (data.tunnels && data.tunnels.length > 0) {
      // Find https tunnel
      const httpstunnel = data.tunnels.find(t => t.proto === 'https');
      return httpstunnel ? httpstunnel.public_url : data.tunnels[0].public_url;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function updateEnvWithNgrokUrl() {
  log('step', 'Waiting for ngrok to establish tunnel...');
  
  let retries = 0;
  let url = null;
  
  while (!url && retries < 15) {
    await sleep(500);
    url = await getNgrokUrl();
    retries++;
  }
  
  if (!url) {
    log('error', 'Could not get ngrok URL. Is ngrok running?');
    return false;
  }
  
  log('success', `Ngrok tunnel established: ${url}`);
  
  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace or add CALLBACK_URL
  if (envContent.includes('CALLBACK_URL=')) {
    envContent = envContent.replace(
      /CALLBACK_URL=.*/,
      `CALLBACK_URL=${url}/callback`
    );
  } else {
    envContent += `\nCALLBACK_URL=${url}/callback\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  log('success', `Updated .env with callback URL`);
  
  console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════' + COLORS.reset);
  console.log(COLORS.green + '✓ Jambostar Ready!' + COLORS.reset);
  console.log(COLORS.cyan + '═══════════════════════════════════════════════════' + COLORS.reset);
  console.log(`\n📱 Public URL (for M-Pesa callbacks):\n   ${COLORS.magenta}${url}${COLORS.reset}\n`);
  console.log(`🌐 Access your app at:\n   ${COLORS.cyan}http://localhost:3000${COLORS.reset}\n`);
  console.log(`${COLORS.yellow}Note: Keep this terminal open. Press Ctrl+C to stop.${COLORS.reset}\n`);
  console.log(COLORS.cyan + '═══════════════════════════════════════════════════' + COLORS.reset + '\n');
  
  return true;
}

async function startServer() {
  log('rocket', 'Starting Express server...');
  
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      shell: true,
    });

    server.on('error', (error) => {
      log('error', `Failed to start server: ${error.message}`);
      reject(error);
    });

    server.on('close', (code) => {
      log('warning', `Server exited with code ${code}`);
      resolve();
    });
  });
}

async function runStartupSequence() {
  try {
    log('info', 'Jambostar Startup Sequence');
    log('info', '─────────────────────────\n');
    
    log('step', 'Starting ngrok tunnel to port 3000...');
    
    // Start ngrok in background
    const ngrok = spawn('ngrok', ['http', '3000', '--log=stdout'], {
      stdio: 'pipe',
    });

    ngrok.on('error', (error) => {
      log('error', `Failed to start ngrok: ${error.message}`);
      process.exit(1);
    });
    
    // Update .env with ngrok URL
    await sleep(2000);
    const success = await updateEnvWithNgrokUrl();
    
    if (!success) {
      ngrok.kill();
      process.exit(1);
    }
    
    // Start server
    await startServer();
    
  } catch (error) {
    log('error', error.message);
    process.exit(1);
  }
}

// Run startup
runStartupSequence();
