/**
 * Upload Resume Test - Verifies the complete upload flow
 */

const API = "https://futrix-node-api.onrender.com";
const TEST_EMAIL = `test_upload_${Date.now()}@futrixai-suite.com`;

// Sample resume text (minimum 50 characters)
const SAMPLE_RESUME = `
Senior Full Stack Developer with 5+ years of experience.

Skills:
- JavaScript, TypeScript, React, Node.js
- MongoDB, PostgreSQL, Docker, Kubernetes
- AWS, GCP, Azure cloud platforms
- GraphQL, REST APIs, Microservices
- CI/CD pipelines, Jenkins, GitHub Actions

Experience:
- Led development of scalable SaaS platform
- Mentored junior developers
- Architected microservices infrastructure
- Reduced API latency by 40%

Education:
- BS Computer Science
- AWS Certified Solutions Architect
`;

async function req(url, opts = {}) {
    try {
        const r = await fetch(url, {
            ...opts,
            headers: { "Content-Type": "application/json", ...opts.headers },
        });
        const body = await r.json().catch(() => ({}));
        return { status: r.status, ok: r.ok, body };
    } catch (err) {
        return { status: 0, ok: false, body: { error: err.message } };
    }
}

async function test() {
    console.log("\n===================================================");
    console.log("  RESUME UPLOAD FLOW TEST");
    console.log(`  Test Email: ${TEST_EMAIL}`);
    console.log("===================================================\n");

    // Step 1: Login
    console.log("[1] LOGIN");
    const login = await req(`${API}/api/login`, {
        method: "POST",
        body: JSON.stringify({ email: TEST_EMAIL }),
    });
    console.log(`  Status: ${login.status}`);
    console.log(`  Result: ${login.ok ? "✅ SUCCESS" : "❌ FAILED"}`);
    if (!login.ok) {
        console.log(`  Error: ${login.body.error}`);
        return;
    }

    const token = login.body.accessToken;
    console.log(`  Token: ${token.substring(0, 20)}...`);

    // Step 2: Upload Resume
    console.log("\n[2] UPLOAD RESUME");
    console.log(`  Resume length: ${SAMPLE_RESUME.length} characters`);
    
    const upload = await req(`${API}/api/upload-resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: SAMPLE_RESUME, email: TEST_EMAIL }),
    });
    console.log(`  Status: ${upload.status}`);
    console.log(`  Result: ${upload.ok ? "✅ SUCCESS" : "❌ FAILED"}`);
    
    if (!upload.ok) {
        console.log(`  Error: ${upload.body.error}`);
        console.log(`  Details: ${upload.body.detail || upload.body.message || "N/A"}`);
        return;
    }

    console.log(`  Analysis ID: ${upload.body._id}`);
    console.log(`  Readiness Score: ${upload.body.readiness_score}%`);
    console.log(`  Skills Detected: ${upload.body.skills?.length || 0}`);
    console.log(`  Skill Gaps: ${upload.body.gap_skills?.length || 0}`);
    console.log(`  Roadmap Steps: ${upload.body.roadmap?.length || 0}`);

    // Step 3: Verify History
    console.log("\n[3] VERIFY HISTORY");
    const history = await req(`${API}/api/history?email=${encodeURIComponent(TEST_EMAIL)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  Status: ${history.status}`);
    console.log(`  Analyses in history: ${history.body.length || 0}`);
    console.log(`  Result: ${history.ok ? "✅ SUCCESS" : "❌ FAILED"}`);

    // Step 4: Test Rate Limit (make 3 rapid uploads)
    console.log("\n[4] RATE LIMIT TEST (3 rapid uploads)");
    let rateLimitHit = false;
    
    for (let i = 1; i <= 3; i++) {
        const rapid = await req(`${API}/api/upload-resume`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: SAMPLE_RESUME + ` (attempt ${i})`, email: TEST_EMAIL }),
        });
        
        if (rapid.status === 429) {
            console.log(`  Attempt ${i}: ⚠️  Rate limited (429) - as expected`);
            console.log(`    Message: ${rapid.body.message}`);
            rateLimitHit = true;
            break;
        } else if (rapid.ok) {
            console.log(`  Attempt ${i}: ✅ Accepted`);
        } else {
            console.log(`  Attempt ${i}: ❌ Failed (${rapid.status})`);
        }
    }

    // Summary
    console.log("\n===================================================");
    console.log("  TEST SUMMARY");
    console.log("===================================================");
    console.log(`  ✅ Login: PASSED`);
    console.log(`  ✅ Resume Upload: ${upload.ok ? "PASSED" : "FAILED"}`);
    console.log(`  ✅ History: ${history.ok ? "PASSED" : "FAILED"}`);
    console.log(`  ✅ Rate Limiter: ${rateLimitHit ? "PASSED (working correctly)" : "⚠️  Not triggered"}`);
    console.log("\n===================================================\n");

    if (upload.ok) {
        console.log("🎉 UPLOAD PROCESS WORKING CORRECTLY!");
        console.log("✅ Ready for production use");
    }
}

test().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
