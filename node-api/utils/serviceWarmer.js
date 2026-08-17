/**
 * Service Warmer - Keeps Render's free tier Python AI service warm
 * Prevents cold starts by making periodic ping requests
 */

const axios = require('axios');

const PYTHON_URL = (process.env.PYTHON_URL || 'http://localhost:8000').replace(/\/$/, '');
let warmerInterval = null;

/**
 * Start the warming service
 * Makes a ping request every 5 minutes to keep Python AI warm
 */
function startWarmer() {
    if (warmerInterval) {
        console.log('⚠️  Service warmer already running');
        return;
    }

    // Only warm in production
    if (process.env.NODE_ENV !== 'production') {
        console.log('ℹ️  Service warmer disabled (development mode)');
        return;
    }

    // Skip if Python URL is localhost (dev environment)
    if (PYTHON_URL === 'http://localhost:8000') {
        console.log('ℹ️  Service warmer disabled (Python URL is localhost)');
        return;
    }

    console.log('🔥 Starting service warmer for Python AI');
    console.log(`   Target: ${PYTHON_URL}`);
    console.log('   Interval: Every 5 minutes');

    // Initial ping
    warmPythonService();

    // Warm every 5 minutes (300,000ms)
    warmerInterval = setInterval(() => {
        warmPythonService();
    }, 5 * 60 * 1000);

    // Prevent the interval from blocking process shutdown
    if (warmerInterval.unref) {
        warmerInterval.unref();
    }
}

/**
 * Make a warm-up request to the Python service
 */
async function warmPythonService() {
    try {
        const startTime = Date.now();
        
        const response = await axios.get(`${PYTHON_URL}/`, {
            timeout: 10_000,
            headers: {
                'User-Agent': 'Futrix-ServiceWarmer/1.0'
            }
        });
        
        const duration = Date.now() - startTime;
        console.log(`✅ Service warmer ping: ${response.status} (${duration}ms)`);
    } catch (err) {
        const duration = Date.now() - startTime;
        const msg = err.response?.status || err.code || err.message;
        
        if (err.code === 'ECONNREFUSED') {
            console.log(`⚠️  Service warmer: AI service offline (${duration}ms) - may be cold starting`);
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            console.log(`⚠️  Service warmer: Timeout (${duration}ms) - AI service may be under load`);
        } else {
            console.log(`⚠️  Service warmer error: ${msg} (${duration}ms)`);
        }
    }
}

/**
 * Stop the warming service
 */
function stopWarmer() {
    if (warmerInterval) {
        clearInterval(warmerInterval);
        warmerInterval = null;
        console.log('🛑 Service warmer stopped');
    }
}

module.exports = {
    startWarmer,
    stopWarmer,
    warmPythonService
};
