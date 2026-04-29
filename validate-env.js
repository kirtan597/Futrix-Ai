const fs = require('fs');
const path = require('path');

console.log('🔍 Futrix AI Environment Validation');
console.log('=====================================\n');

let hasErrors = false;

// Check if file exists
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// Read file content safely
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

// Parse .env file
function parseEnvFile(content) {
    const env = {};
    if (!content) return env;
    
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    return env;
}

// Validation functions
function validateNodeApiEnv() {
    console.log('📦 Node API Environment:');
    
    const envPath = path.join(__dirname, 'node-api', '.env');
    if (!fileExists(envPath)) {
        console.log('  ❌ .env file missing');
        hasErrors = true;
        return;
    }
    
    const envContent = readFile(envPath);
    const env = parseEnvFile(envContent);
    
    const required = [
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];
    
    required.forEach(key => {
        if (env[key]) {
            if (key.includes('SECRET') && env[key].length < 32) {
                console.log(`  ⚠️  ${key}: Too short (${env[key].length} chars, need 32+)`);
                hasErrors = true;
            } else {
                console.log(`  ✅ ${key}: Set`);
            }
        } else {
            console.log(`  ❌ ${key}: Missing`);
            hasErrors = true;
        }
    });
    
    // Check MongoDB URI format
    if (env.MONGO_URI && !env.MONGO_URI.startsWith('mongodb://')) {
        console.log('  ⚠️  MONGO_URI: Invalid format (should start with mongodb://)');
        hasErrors = true;
    }
    
    console.log();
}

function validateClientEnv() {
    console.log('⚛️  Client Environment:');
    
    const envPath = path.join(__dirname, 'client', '.env');
    if (!fileExists(envPath)) {
        console.log('  ❌ .env file missing');
        hasErrors = true;
        return;
    }
    
    const envContent = readFile(envPath);
    const env = parseEnvFile(envContent);
    
    const required = ['VITE_GOOGLE_CLIENT_ID'];
    
    required.forEach(key => {
        if (env[key]) {
            console.log(`  ✅ ${key}: Set`);
        } else {
            console.log(`  ❌ ${key}: Missing`);
            hasErrors = true;
        }
    });
    
    if (env.VITE_API_URL) {
        console.log(`  ✅ VITE_API_URL: ${env.VITE_API_URL}`);
    } else {
        console.log('  ℹ️  VITE_API_URL: Not set (will use proxy)');
    }
    
    console.log();
}

function validatePackageFiles() {
    console.log('📋 Package Files:');
    
    const packages = [
        { name: 'Node API', path: 'node-api/package.json' },
        { name: 'Client', path: 'client/package.json' },
        { name: 'Python AI', path: 'python-ai/requirements.txt' },
        { name: 'Java Gateway', path: 'java-gateway/pom.xml' }
    ];
    
    packages.forEach(pkg => {
        if (fileExists(path.join(__dirname, pkg.path))) {
            console.log(`  ✅ ${pkg.name}: ${pkg.path}`);
        } else {
            console.log(`  ❌ ${pkg.name}: ${pkg.path} missing`);
            hasErrors = true;
        }
    });
    
    console.log();
}

function validateDirectoryStructure() {
    console.log('📁 Directory Structure:');
    
    const requiredDirs = [
        'node-api',
        'client',
        'python-ai',
        'java-gateway',
        'node-api/models',
        'node-api/routes',
        'node-api/middleware',
        'node-api/utils',
        'client/src',
        'client/src/components',
        'client/src/pages',
        'client/src/store',
        'client/src/services'
    ];
    
    requiredDirs.forEach(dir => {
        if (fs.existsSync(path.join(__dirname, dir))) {
            console.log(`  ✅ ${dir}/`);
        } else {
            console.log(`  ❌ ${dir}/ missing`);
            hasErrors = true;
        }
    });
    
    console.log();
}

function validateCriticalFiles() {
    console.log('🔧 Critical Files:');
    
    const criticalFiles = [
        'node-api/server.js',
        'node-api/routes/userRoutes.js',
        'node-api/middleware/auth.js',
        'node-api/utils/authUtils.js',
        'client/src/App.tsx',
        'client/src/main.tsx',
        'client/src/store/useAuth.ts',
        'client/src/services/apiService.ts',
        'client/src/pages/Login.tsx',
        'python-ai/main.py',
        'python-ai/ai_engine.py',
        'java-gateway/pom.xml'
    ];
    
    criticalFiles.forEach(file => {
        if (fileExists(path.join(__dirname, file))) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ ${file} missing`);
            hasErrors = true;
        }
    });
    
    console.log();
}

function validateGoogleOAuthConsistency() {
    console.log('🔐 Google OAuth Consistency:');
    
    const nodeEnvPath = path.join(__dirname, 'node-api', '.env');
    const clientEnvPath = path.join(__dirname, 'client', '.env');
    
    const nodeEnv = parseEnvFile(readFile(nodeEnvPath));
    const clientEnv = parseEnvFile(readFile(clientEnvPath));
    
    if (nodeEnv.GOOGLE_CLIENT_ID && clientEnv.VITE_GOOGLE_CLIENT_ID) {
        if (nodeEnv.GOOGLE_CLIENT_ID === clientEnv.VITE_GOOGLE_CLIENT_ID) {
            console.log('  ✅ Google Client IDs match');
        } else {
            console.log('  ❌ Google Client IDs do not match');
            console.log(`    Node API: ${nodeEnv.GOOGLE_CLIENT_ID}`);
            console.log(`    Client:   ${clientEnv.VITE_GOOGLE_CLIENT_ID}`);
            hasErrors = true;
        }
    } else {
        console.log('  ⚠️  Cannot verify Google Client ID consistency (missing values)');
    }
    
    console.log();
}

// Run all validations
validateDirectoryStructure();
validatePackageFiles();
validateNodeApiEnv();
validateClientEnv();
validateGoogleOAuthConsistency();
validateCriticalFiles();

// Summary
console.log('📊 Validation Summary:');
console.log('======================');

if (hasErrors) {
    console.log('❌ Issues found! Please fix the errors above before starting the application.');
    console.log('\n💡 Quick fixes:');
    console.log('   • Run: npm install (in node-api and client directories)');
    console.log('   • Copy .env.example to .env and configure values');
    console.log('   • Ensure Google OAuth Client IDs match in both .env files');
    console.log('   • Check that all required directories and files exist');
    process.exit(1);
} else {
    console.log('✅ All validations passed! Your environment is ready.');
    console.log('\n🚀 You can now start the application with:');
    console.log('   ./start-dev.bat');
}

console.log();