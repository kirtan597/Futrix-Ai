#!/usr/bin/env node
/**
 * Deployment Diagnostics Script
 * Verifies all services are properly connected
 * Usage: node diagnose.js [NODE_API_URL] [PYTHON_AI_URL]
 * 
 * Examples:
 *   node diagnose.js http://localhost:5000 http://localhost:8000
 *   node diagnose.js https://futrix-node-api.onrender.com https://futrix-python-ai.onrender.com
 */

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
const NODE_API_URL = args[0] || 'http://localhost:5000';
const PYTHON_URL = args[1] || 'http://localhost:8000';

console.log('\n🔍 Futrix AI Deployment Diagnostics\n');
console.log(`📍 Checking Node API: ${NODE_API_URL}`);
console.log(`🐍 Checking Python AI: ${PYTHON_URL}\n`);

function request(url, timeout = 10000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        const req = client.get(url, { timeout }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data,
                    duration
                });
            });
        });
        
        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            resolve({
                error: err.message,
                code: err.code,
                duration
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            const duration = Date.now() - startTime;
            resolve({
                error: 'TIMEOUT',
                code: 'ETIMEDOUT',
                duration
            });
        });
    });
}

async function diagnose() {
    console.log('═══════════════════════════════════════════\n');
    
    // Check Node API health
    console.log('1️⃣  Node API Health Check');
    console.log(`   GET ${NODE_API_URL}/health`);
    
    let nodeHealth = await request(`${NODE_API_URL}/health`);
    if (nodeHealth.error) {
        console.log(`   ❌ FAILED: ${nodeHealth.error} (${nodeHealth.code})`);
        console.log(`   ⏱️  Duration: ${nodeHealth.duration}ms`);
        console.log('\n   💡 Troubleshooting:');
        console.log('      - Is Node API running?');
        console.log('      - Is the URL correct?');
        console.log('      - Check firewall/ports');
    } else {
        console.log(`   ✅ SUCCESS: HTTP ${nodeHealth.status} (${nodeHealth.duration}ms)`);
        try {
            const data = JSON.parse(nodeHealth.body);
            console.log(`   📊 Environment: ${data.environment}`);
            console.log(`   🐍 Python URL: ${data.pythonUrl}`);
            console.log(`   🔧 Services:`);
            for (const [key, value] of Object.entries(data.services || {})) {
                console.log(`      - ${key}: ${value}`);
            }
        } catch (e) {
            console.log(`   Response: ${nodeHealth.body.substring(0, 100)}...`);
        }
    }
    
    console.log('\n═══════════════════════════════════════════\n');
    
    // Check Python AI health
    console.log('2️⃣  Python AI Health Check');
    console.log(`   GET ${PYTHON_URL}/health`);
    
    let pythonHealth = await request(`${PYTHON_URL}/health`);
    if (pythonHealth.error) {
        console.log(`   ❌ FAILED: ${pythonHealth.error} (${pythonHealth.code})`);
        console.log(`   ⏱️  Duration: ${pythonHealth.duration}ms`);
        console.log('\n   💡 Troubleshooting:');
        console.log('      - Is Python AI service running?');
        console.log('      - Is the URL correct?');
        console.log('      - Check Render deployment status');
    } else {
        console.log(`   ✅ SUCCESS: HTTP ${pythonHealth.status} (${pythonHealth.duration}ms)`);
        console.log(`   Response: ${pythonHealth.body}`);
    }
    
    console.log('\n═══════════════════════════════════════════\n');
    
    // Check Python AI root
    console.log('3️⃣  Python AI Root Endpoint');
    console.log(`   GET ${PYTHON_URL}/`);
    
    let pythonRoot = await request(`${PYTHON_URL}/`);
    if (pythonRoot.error) {
        console.log(`   ❌ FAILED: ${pythonRoot.error} (${pythonRoot.code})`);
    } else {
        console.log(`   ✅ SUCCESS: HTTP ${pythonRoot.status} (${pythonRoot.duration}ms)`);
        try {
            const data = JSON.parse(pythonRoot.body);
            console.log(`   📝 Version: ${data.version}`);
            console.log(`   🔌 Endpoints:`);
            (data.endpoints || []).forEach(ep => console.log(`      - ${ep}`));
        } catch (e) {
            console.log(`   Response: ${pythonRoot.body.substring(0, 100)}...`);
        }
    }
    
    console.log('\n═══════════════════════════════════════════\n');
    
    // Summary
    console.log('📋 SUMMARY\n');
    
    const nodeOk = !nodeHealth.error;
    const pythonOk = !pythonHealth.error;
    
    if (nodeOk && pythonOk) {
        console.log('✅ All services are online!');
        console.log('\nℹ️  If you still get 503 errors:');
        console.log('   1. Check Node API logs for connection errors');
        console.log('   2. Try uploading a small resume (50+ chars)');
        console.log('   3. Check Python AI logs for analysis errors');
    } else if (nodeOk && !pythonOk) {
        console.log('⚠️  Node API is online, but Python AI is unreachable.');
        console.log('\n🔧 Fix:');
        console.log(`   1. Deploy Python AI to Render.com`);
        console.log(`   2. Copy its URL`);
        console.log(`   3. Set PYTHON_URL env var in Node API`);
        console.log(`   4. Redeploy Node API`);
    } else {
        console.log('❌ Node API is not responding.');
        console.log('\n🔧 Fix:');
        console.log(`   1. Check if Node API is deployed`);
        console.log(`   2. Check Render.com deployment status`);
        console.log(`   3. Check environment variables`);
        console.log(`   4. Restart the service`);
    }
    
    console.log('\n═══════════════════════════════════════════\n');
}

diagnose().catch(console.error);
