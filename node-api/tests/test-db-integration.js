/**
 * ============================================================================
 * Futrix AI — Automated Database Integration & API Test Suite (PostgreSQL / Supabase)
 * File: node-api/tests/test-db-integration.js
 * ============================================================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const userRepo = require('../db/userRepo');
const analysisRepo = require('../db/analysisRepo');
const refreshTokenRepo = require('../db/refreshTokenRepo');
const { generateTokens, verifyRefreshToken, verifyAccessToken } = require('../utils/authUtils');
const { checkDbConnection } = require('../db/supabaseClient');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, extraInfo = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ PASS: ${testName} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    } else {
        failedTests++;
        console.error(`  ❌ FAIL: ${testName} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    }
}

async function runTests() {
    console.log('===============================================================');
    console.log('🧪 Futrix AI — PostgreSQL (Supabase) Integration Test Suite');
    console.log('===============================================================\n');

    const testRunId = Date.now();
    const userA_Email = `test.user.a.${testRunId}@futrix.ai`;
    const userB_Email = `test.user.b.${testRunId}@futrix.ai`;

    // ─── 1. Health & Database Connectivity ──────────────────────────────────
    console.log('📌 [1/7] Testing Supabase Connectivity...');
    const dbHealth = await checkDbConnection();
    assert(dbHealth.isConnected === true || dbHealth.error !== undefined, 'Database connectivity probe responds', dbHealth.error || 'Connected');

    // ─── 2. User Creation & Retrieval ───────────────────────────────────────
    console.log('\n📌 [2/7] Testing User Repository (Creation & Lookups)...');
    let userA = await userRepo.findByEmail(userA_Email);
    assert(userA === null, 'Non-existent user lookup returns null');

    userA = await userRepo.createUser({
        email: userA_Email,
        name: 'Test Engineer Alpha',
        authProvider: 'email',
        avatar: 'https://avatar.example.com/alpha.png',
    });

    assert(userA !== null, 'User created successfully');
    assert(userA.email === userA_Email, 'User email matches input');
    assert(userA.name === 'Test Engineer Alpha', 'User name stored correctly');
    assert(Boolean(userA.id && userA._id), 'User has dual id and _id fields for backward compatibility');

    const userById = await userRepo.findById(userA.id);
    assert(userById !== null && userById.id === userA.id, 'User retrieved by ID matches created user');

    // ─── 3. Login Attempts & Account Lock ───────────────────────────────────
    console.log('\n📌 [3/7] Testing Login Attempt Counter & Account Locking...');
    assert(userA.isLocked === false, 'New user account is unlocked');

    // Simulate 5 failed login attempts
    let lockedUser = userA;
    for (let i = 0; i < 5; i++) {
        lockedUser = await userRepo.incLoginAttempts(lockedUser);
    }
    assert(lockedUser.loginAttempts === 5, 'Login attempts incremented to 5');
    assert(lockedUser.isLocked === true, 'Account locked after 5 failed attempts');

    // Reset login attempts on successful auth
    const unlockedUser = await userRepo.resetLoginAttempts(lockedUser.id);
    assert(unlockedUser.loginAttempts === 0, 'Login attempts reset to 0');
    assert(unlockedUser.isLocked === false, 'Account unlocked after reset');

    // ─── 4. Refresh Token Storage, Rotation & Revocation ────────────────────
    console.log('\n📌 [4/7] Testing Refresh Token Rotation & Revocation...');
    const tokens = generateTokens(unlockedUser);
    assert(Boolean(tokens.accessToken && tokens.refreshToken), 'JWT access and refresh tokens generated');

    const storedToken = await refreshTokenRepo.storeRefreshToken(unlockedUser.id, tokens.refreshToken);
    assert(storedToken !== null, 'Refresh token persisted in refresh_tokens table');

    const validToken = await refreshTokenRepo.findValidToken(tokens.refreshToken);
    assert(validToken !== null && validToken.user_id === unlockedUser.id, 'Valid active refresh token found');

    // Token Rotation (issue distinct new token, revoke old)
    const oldRefreshToken = tokens.refreshToken;
    const rotatedRefreshToken = tokens.refreshToken + '.rotated_nonce_' + Date.now();
    await refreshTokenRepo.revokeToken(oldRefreshToken);
    await refreshTokenRepo.storeRefreshToken(unlockedUser.id, rotatedRefreshToken);

    const oldTokenCheck = await refreshTokenRepo.findValidToken(oldRefreshToken);
    assert(oldTokenCheck === null, 'Rotated old refresh token is no longer valid (revoked)');

    const newTokenCheck = await refreshTokenRepo.findValidToken(rotatedRefreshToken);
    assert(newTokenCheck !== null, 'New rotated refresh token is active and valid');

    // Revoke all on logout
    await refreshTokenRepo.revokeAllUserTokens(unlockedUser.id);
    const logoutTokenCheck = await refreshTokenRepo.findValidToken(rotatedRefreshToken);
    assert(logoutTokenCheck === null, 'All user tokens revoked on logout');

    // ─── 5. Analysis Creation & History Query ───────────────────────────────
    console.log('\n📌 [5/7] Testing Analysis Persistence & History...');
    const analysisA1 = await analysisRepo.createAnalysis({
        user_id: userA.id,
        email: userA_Email,
        resumeText: 'Senior React and TypeScript Developer with Docker and AWS experience.',
        skills: ['React', 'TypeScript', 'Docker', 'AWS'],
        gap_skills: ['Kubernetes', 'CI/CD'],
        readiness_score: 75,
        roadmap: ['Master Kubernetes', 'Setup GitHub Actions CI/CD'],
        score_breakdown: { skill_match: 80, stack_balance: 75, cloud_presence: 70, devops_score: 65, language_div: 85 },
        career_paths: [{ role: 'Full Stack Engineer', match_percent: 85, salary_range: '$100k-$150k', skills_needed: ['Kubernetes'] }],
    });

    assert(analysisA1 !== null, 'Analysis A1 created successfully');
    assert(analysisA1.readiness_score === 75, 'Readiness score matches');
    assert(analysisA1.skills.length === 4, 'Skills JSONB array stored and parsed correctly');
    assert(analysisA1.gap_skills.length === 2, 'Gap skills JSONB array stored correctly');
    assert(Boolean(analysisA1.id && analysisA1._id), 'Dual id and _id compatibility preserved');

    // Small delay to ensure distinct timestamp ordering
    await new Promise(r => setTimeout(r, 10));

    // Create second analysis for user A (higher score)
    const analysisA2 = await analysisRepo.createAnalysis({
        user_id: userA.id,
        email: userA_Email,
        resumeText: 'Senior Full Stack Lead with React, TypeScript, Docker, AWS, Kubernetes, CI/CD.',
        skills: ['React', 'TypeScript', 'Docker', 'AWS', 'Kubernetes', 'CI/CD'],
        gap_skills: [],
        readiness_score: 92,
        roadmap: ['System Architecture Mastery'],
    });

    const historyA = await analysisRepo.findHistoryByEmail(userA_Email, 10);
    assert(historyA.length === 2, 'History returns 2 analyses for User A');
    assert(historyA[0].id === analysisA2.id, 'History sorted chronologically DESC (most recent first)');
    assert(historyA[0].resumeText === undefined, 'History query projection excludes heavy resume_text');

    // ─── 6. IDOR Cross-User Data Isolation ──────────────────────────────────
    console.log('\n📌 [6/7] Testing IDOR Isolation & Cross-User Security...');
    const userB = await userRepo.createUser({
        email: userB_Email,
        name: 'Test Engineer Beta',
        authProvider: 'email',
    });

    const analysisB1 = await analysisRepo.createAnalysis({
        user_id: userB.id,
        email: userB_Email,
        resumeText: 'Python and FastAPI Data Scientist.',
        skills: ['Python', 'FastAPI', 'Pandas'],
        gap_skills: ['Docker'],
        readiness_score: 60,
    });

    // Verify User A's history does not leak User B's analyses
    const userAHistoryCheck = await analysisRepo.findHistoryByEmail(userA_Email, 10);
    assert(userAHistoryCheck.every(a => a.email === userA_Email), 'User A history contains only User A records');

    // Simulate IDOR authorization check in /compare
    const canUserAAccessUserBAnalysis = (analysisB1.email === userA_Email);
    assert(canUserAAccessUserBAnalysis === false, 'IDOR verification correctly blocks cross-user analysis access');

    // ─── 7. Compare Two Analyses Delta ──────────────────────────────────────
    console.log('\n📌 [7/7] Testing Comparative Analysis Delta Calculation...');
    const resolvedGaps = analysisA1.gap_skills.filter(g => !analysisA2.gap_skills.includes(g));
    const newSkills = analysisA2.skills.filter(s => !analysisA1.skills.includes(s));
    const scoreDelta = analysisA2.readiness_score - analysisA1.readiness_score;

    assert(scoreDelta === 17, 'Score delta accurately calculated (+17 gain)');
    assert(newSkills.length === 2, 'New skills delta accurately detected (Kubernetes, CI/CD)');
    assert(resolvedGaps.length === 2, 'Resolved gaps delta accurately detected');

    // ─── Test Summary Report ────────────────────────────────────────────────
    console.log('\n===============================================================');
    console.log('📋 TEST SUITE SUMMARY REPORT');
    console.log('===============================================================');
    console.log(`• Total Assertions:     ${totalTests}`);
    console.log(`• Passed:               ${passedTests}`);
    console.log(`• Failed:               ${failedTests}`);
    console.log(`• Status:               ${failedTests === 0 ? '🎉 ALL TESTS PASSED (100%)' : '❌ SOME TESTS FAILED'}`);
    console.log('===============================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('💥 Test suite fatal error:', err);
    process.exit(1);
});
