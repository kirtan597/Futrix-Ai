#!/usr/bin/env node

/**
 * OAuth Setup Helper Script
 * Generates secure JWT secrets and helps configure OAuth
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function generateSecret() {
    return crypto.randomBytes(32).toString('hex');
}

async function main() {
    console.log('\n🔐 Career Twin AI - OAuth Setup Helper\n');
    console.log('This script will help you configure secure OAuth authentication.\n');

    // Generate secrets
    const jwtSecret = generateSecret();
    const jwtRefreshSecret = generateSecret();

    console.log('✅ Generated secure JWT secrets\n');

    // Get Google Client ID
    const googleClientId = await question('Enter your Google OAuth Client ID (or press Enter to skip): ');
    const googleClientSecret = await question('Enter your Google OAuth Client Secret (optional, press Enter to skip): ');

    // Get MongoDB URI
    const mongoUri = await question('Enter MongoDB URI (default: mongodb://localhost:27017/futrixai): ') || 'mongodb://localhost:27017/futrixai';

    // Backend .env
    const backendEnv = `MONGO_URI=${mongoUri}
PORT=5000
AI_SERVICE_URL=http://localhost:8000/analyze
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
GOOGLE_CLIENT_ID=${googleClientId || 'your-google-client-id.apps.googleusercontent.com'}
GOOGLE_CLIENT_SECRET=${googleClientSecret || ''}
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
`;

    // Frontend .env
    const frontendEnv = `VITE_GOOGLE_CLIENT_ID=${googleClientId || 'your-google-client-id.apps.googleusercontent.com'}
`;

    // Write files
    const backendEnvPath = path.join(__dirname, 'node-api', '.env');
    const frontendEnvPath = path.join(__dirname, 'client', '.env');

    try {
        // Backup existing files
        if (fs.existsSync(backendEnvPath)) {
            fs.copyFileSync(backendEnvPath, backendEnvPath + '.backup');
            console.log('\n📦 Backed up existing node-api/.env to .env.backup');
        }
        if (fs.existsSync(frontendEnvPath)) {
            fs.copyFileSync(frontendEnvPath, frontendEnvPath + '.backup');
            console.log('📦 Backed up existing client/.env to .env.backup');
        }

        // Write new files
        fs.writeFileSync(backendEnvPath, backendEnv);
        fs.writeFileSync(frontendEnvPath, frontendEnv);

        console.log('\n✅ Configuration files created successfully!\n');
        console.log('📁 Files created:');
        console.log('   - node-api/.env');
        console.log('   - client/.env\n');

        if (!googleClientId) {
            console.log('⚠️  Google OAuth not configured. To set it up:');
            console.log('   1. Go to https://console.cloud.google.com/');
            console.log('   2. Create OAuth 2.0 credentials');
            console.log('   3. Add the Client ID to both .env files\n');
        }

        console.log('📖 Next steps:');
        console.log('   1. Review the generated .env files');
        console.log('   2. Start MongoDB: mongod');
        console.log('   3. Start backend: cd node-api && npm start');
        console.log('   4. Start frontend: cd client && npm run dev');
        console.log('   5. Read OAUTH_SECURITY.md for detailed documentation\n');

        console.log('🔒 Security reminders:');
        console.log('   - Never commit .env files to version control');
        console.log('   - Use different secrets for production');
        console.log('   - Enable HTTPS in production');
        console.log('   - Regularly rotate JWT secrets\n');

    } catch (error) {
        console.error('\n❌ Error writing configuration files:', error.message);
        process.exit(1);
    }

    rl.close();
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
