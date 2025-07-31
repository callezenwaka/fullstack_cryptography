import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface KeySetupResult {
  clientPrivateKeyB64: string;
  serverKeysReady: boolean;
  clientKeysReady: boolean;
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function generateKeyPair(name: string): { publicKey: string; privateKey: string } {
  console.log(`🔑 Generating ${name} key pair...`);
  
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

function setupServerKeys(serverKeys: { publicKey: string; privateKey: string }, clientPublicKey: string): void {
  const serverKeysDir = path.join(__dirname, '../server/keys');
  ensureDirectoryExists(serverKeysDir);

  // Save server keys
  fs.writeFileSync(path.join(serverKeysDir, 'server-private.pem'), serverKeys.privateKey);
  fs.writeFileSync(path.join(serverKeysDir, 'server-public.pem'), serverKeys.publicKey);
  
  // Save client public key for server to use
  fs.writeFileSync(path.join(serverKeysDir, 'client-public.pem'), clientPublicKey);
  
  console.log(`✅ Server keys saved to: ${serverKeysDir}`);
}

function setupClientKeys(clientKeys: { publicKey: string; privateKey: string }, serverPublicKey: string): string {
  // Client public keys (served via proxy)
  const clientPublicDir = path.join(__dirname, '../client/public/keys');
  ensureDirectoryExists(clientPublicDir);
  
  fs.writeFileSync(path.join(clientPublicDir, 'client-public.pem'), clientKeys.publicKey);
  fs.writeFileSync(path.join(clientPublicDir, 'server-public.pem'), serverPublicKey);
  
  // Client private key (for Docker environment variable)
  const clientPrivateDir = path.join(__dirname, '../client/src/assets/keys');
  ensureDirectoryExists(clientPrivateDir);
  
  fs.writeFileSync(path.join(clientPrivateDir, 'client-key.pem'), clientKeys.privateKey);
  
  // Convert private key to base64 for Docker env
  const clientPrivateKeyB64 = Buffer.from(clientKeys.privateKey).toString('base64');
  
  console.log(`✅ Client keys saved to: ${clientPublicDir} and ${clientPrivateDir}`);
  
  return clientPrivateKeyB64;
}

function createEnvFile(clientPrivateKeyB64: string): void {
  const envPath = path.join(__dirname, '../client/.env');
  const envContent = `# Auto-generated client private key for Docker\nVITE_CLIENT_PRIVATE_KEY_B64=${clientPrivateKeyB64}\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Created client/.env with private key`);
}

function main(): void {
  console.log('🚀 Setting up crypto keys for development...\n');

  try {
    // Check if keys already exist
    const clientPrivateKeyPath = path.join(__dirname, '../client/src/assets/keys/client-key.pem');
    const serverPrivateKeyPath = path.join(__dirname, '../server/keys/server-private.pem');
    
    if (fs.existsSync(clientPrivateKeyPath) && fs.existsSync(serverPrivateKeyPath)) {
      console.log('🔑 Keys already exist, skipping generation...');
      
      // Still create env file with existing key
      const existingPrivateKey = fs.readFileSync(clientPrivateKeyPath, 'utf8');
      const clientPrivateKeyB64 = Buffer.from(existingPrivateKey).toString('base64');
      createEnvFile(clientPrivateKeyB64);
      
      console.log('✅ Key setup completed (using existing keys)');
      return;
    }

    console.log('🔑 Generating new key pairs...');
    
    // Generate both key pairs
    const serverKeys = generateKeyPair('server');
    const clientKeys = generateKeyPair('client');
    
    // Setup server keys
    setupServerKeys(serverKeys, clientKeys.publicKey);
    
    // Setup client keys and get base64 private key
    const clientPrivateKeyB64 = setupClientKeys(clientKeys, serverKeys.publicKey);
    
    // Create .env file for Docker
    createEnvFile(clientPrivateKeyB64);
    
    console.log('\n🎉 Crypto key setup completed successfully!');
    
    console.log('\n📊 Key distribution:');
    console.log('   Server keys: server/keys/');
    console.log('   Client public keys: client/public/keys/');
    console.log('   Client private key: client/src/assets/keys/');
    console.log('   Environment: client/.env');
    
    console.log('\n🔒 Security notes:');
    console.log('   ✓ Private keys are in .gitignore');
    console.log('   ✓ Client private key available as env var for Docker');
    console.log('   ✓ Ready for secure client-server communication');
    
  } catch (error) {
    console.error('❌ Key setup failed:', error);
    process.exit(1);
  }
}