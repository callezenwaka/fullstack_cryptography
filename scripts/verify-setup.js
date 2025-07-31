#!/usr/bin/env node

// scripts/verify-setup.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Crypto TypeScript App Setup...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Not in project root directory. Please run from fullstack_cryptography/');
  process.exit(1);
}

let errors = 0;
let warnings = 0;

function checkFile(filePath, description, required = true) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    if (required) {
      console.log(`❌ Missing ${description}: ${filePath}`);
      errors++;
    } else {
      console.log(`⚠️  Optional ${description}: ${filePath}`);
      warnings++;
    }
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`✅ ${description}: ${dirPath}/`);
    return true;
  } else {
    console.log(`❌ Missing ${description}: ${dirPath}/`);
    errors++;
    return false;
  }
}

console.log('📁 Checking Directory Structure:');
checkDirectory('server', 'Server directory');
checkDirectory('server/src', 'Server source directory');
checkDirectory('server/keys', 'Server keys directory');
checkDirectory('client', 'Client directory');
checkDirectory('client/src', 'Client source directory');
checkDirectory('client/src/assets', 'Client assets directory');
checkDirectory('client/src/assets/keys', 'Client private keys directory');
checkDirectory('client/public/keys', 'Client public keys directory');
checkDirectory('scripts', 'Scripts directory');
checkDirectory('database', 'Database directory');

console.log('\n📦 Checking Package Files:');
checkFile('package.json', 'Root package.json');
checkFile('server/package.json', 'Server package.json');
checkFile('client/package.json', 'Client package.json');

console.log('\n🔧 Checking Configuration Files:');
checkFile('server/tsconfig.json', 'Server TypeScript config');
checkFile('client/tsconfig.json', 'Client TypeScript config');
checkFile('client/vite.config.ts', 'Vite config');

console.log('\n🐳 Checking Docker Files:');
const dockerComposeExists = checkFile('docker-compose.yml', 'Docker Compose config', false);
checkFile('server/Dockerfile', 'Server Dockerfile', false);
checkFile('client/Dockerfile', 'Client Dockerfile', false);

console.log('\n📝 Checking Key TypeScript Files:');
checkFile('server/src/server.ts', 'Server main file');
checkFile('server/src/utils/keyManager.ts', 'Key manager');
checkFile('server/src/utils/crypto_utils.ts', 'Crypto utilities');
checkFile('client/src/App.tsx', 'React App component');
checkFile('client/src/services/cryptoService.ts', 'Client crypto service');
checkFile('client/src/utils/encryption.ts', 'Client encryption utilities');

console.log('\n🔐 Checking Setup Scripts:');
checkFile('scripts/setupKeys.ts', 'Consolidated key setup script');
checkFile('scripts/setup-database.sh', 'Database setup script');

console.log('\n🛡️ Checking Security Files:');
checkFile('server/keys/.gitignore', 'Server keys .gitignore');
checkFile('client/public/keys/.gitignore', 'Client keys .gitignore');
checkFile('client/src/assets/keys/.gitignore', 'Client private keys .gitignore', false);

console.log('\n🔑 Checking Generated Key Files:');
console.log('   Server Keys (served via API):');
const serverKeysExist = checkFile('server/keys/server-private.pem', 'Server private key', false);
checkFile('server/keys/server-public.pem', 'Server public key', false);
checkFile('server/keys/client-public.pem', 'Client public key (in server)', false);

console.log('   Client Keys (public - served from /keys):');
checkFile('client/public/keys/client-public.pem', 'Client public key', false);
checkFile('client/public/keys/server-public.pem', 'Server public key (in client)', false);

console.log('   Client Keys (private - for Docker env):');
const clientPrivateKeyExists = checkFile('client/src/assets/keys/client-key.pem', 'Client private key', false);
const clientEnvExists = checkFile('client/.env', 'Client environment file', false);

// Legacy check (should be removed after migration)
const legacyPrivateKey = fs.existsSync('client/public/keys/client-private.pem');
if (legacyPrivateKey) {
  console.log('⚠️  Legacy client private key found in public directory - should be removed');
  warnings++;
}

console.log('\n🗄️ Checking Database Files:');
checkFile('database/migrations/001_create_users.sql', 'Users migration');
checkFile('database/migrations/002_create_transactions.sql', 'Transactions migration');
checkFile('database/seeds/users.sql', 'Users seed data');
checkFile('database/seeds/transactions.sql', 'Transactions seed data');

console.log('\n📊 Setup Summary:');
if (warnings > 0) {
  console.log(`⚠️  Warnings: ${warnings}`);
}
if (errors > 0) {
  console.log(`❌ Errors: ${errors}`);
} else {
  console.log('🎉 No errors found!');
}

console.log('\n🚀 Development Options:');

// Check what's available
const hasDocker = dockerComposeExists;
const hasKeys = serverKeysExist && clientPrivateKeyExists;

if (!hasKeys) {
  console.log('\n🔑 Key Setup Required:');
  console.log('Run: npm run setup-keys');
}

if (!fs.existsSync('server/.env')) {
  console.log('\n📝 Environment Setup Required:');
  console.log('Create server/.env with database credentials');
} else {
  console.log('✅ Environment file exists');
}

console.log('\n🛠️ Development Methods:');

if (hasDocker) {
  console.log('\n🐳 DOCKER DEMO (Recommended):');
  console.log('   Commands:');
  console.log('   - Start demo: npm run demo:start');
  console.log('   - View logs: npm run demo:logs');  
  console.log('   - Stop demo: npm run demo:stop');
  console.log('   - Clean demo: npm run demo:clean');
  console.log('   URLs:');
  console.log('   - 🌐 Client: http://localhost:3000');
  console.log('   - 🔧 API: http://localhost:3001');
  console.log('   - 🗄️ Database: http://localhost:8080');
}

console.log('\n💻 LOCAL DEVELOPMENT:');
console.log('   Commands:');
console.log('   - Setup: npm run setup');
console.log('   - Start both: npm run dev:local');

console.log('\n⏭️ Quick Start:');
if (hasDocker && hasKeys) {
  console.log('🎯 Ready! Run: npm run demo:start');
} else if (hasDocker) {
  console.log('1. npm run setup');
  console.log('2. npm run demo:start');
} else {
  console.log('1. npm run setup');
  console.log('2. npm run dev:local');
}

if (errors > 0) {
  console.log(`\n❌ Setup incomplete. Fix ${errors} error(s) above.`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  Setup complete with ${warnings} warning(s).`);
} else {
  console.log('\n🎉 Perfect setup! Ready for crypto demo! 🔐');
}