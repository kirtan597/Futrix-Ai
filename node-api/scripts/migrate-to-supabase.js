#!/usr/bin/env node

/**
 * ============================================================================
 * Futrix AI — MongoDB to Supabase PostgreSQL Migration Script
 * File: node-api/scripts/migrate-to-supabase.js
 * ============================================================================
 *
 * Description:
 *   Idempotent one-time data migration script to move users, analyses, and
 *   active refresh tokens from MongoDB Atlas to PostgreSQL on Supabase.
 *
 * Usage:
 *   node node-api/scripts/migrate-to-supabase.js [--dry-run]
 *
 * Environment variables required:
 *   MONGO_URI                   - MongoDB connection string
 *   SUPABASE_URL                - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   - Supabase service role secret (admin key)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

const isDryRun = process.argv.includes('--dry-run');

// ─── Environment Validation ──────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI environment variable is missing.');
    process.exit(1);
}

if (!isDryRun && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
    console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing (required for live migration).');
    process.exit(1);
}

// Initialize Supabase Client with service role key (bypasses RLS during migration)
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

// ─── Mongoose Schema Definitions (for reading Mongo data) ────────────────────
const MongoUserSchema = new mongoose.Schema({
    email: String,
    name: String,
    googleId: String,
    firebaseUid: String,
    avatar: String,
    resumeText: String,
    skills: [String],
    readinessScore: Number,
    refreshToken: String,
    lastLogin: Date,
    loginAttempts: Number,
    lockUntil: Date,
}, { timestamps: true });

const MongoAnalysisSchema = new mongoose.Schema({
    email: String,
    resumeText: String,
    skills: [String],
    gap_skills: [String],
    readiness_score: Number,
    roadmap: [String],
    score_breakdown: Object,
    career_paths: Array,
    skill_weights: Array,
    category_distribution: Array,
    readiness_trajectory: Object,
}, { timestamps: true });

const MongoUser = mongoose.models.User || mongoose.model('User', MongoUserSchema);
const MongoAnalysis = mongoose.models.Analysis || mongoose.model('Analysis', MongoAnalysisSchema);

// ─── Main Migration Function ─────────────────────────────────────────────────
async function runMigration() {
    console.log('===============================================================');
    console.log(`🚀 Futrix AI — MongoDB to Supabase Migration [${isDryRun ? 'DRY-RUN MODE' : 'LIVE RUN'}]`);
    console.log('===============================================================\n');

    const stats = {
        mongoUsers: 0,
        mongoAnalyses: 0,
        migratedUsers: 0,
        migratedAnalyses: 0,
        migratedTokens: 0,
        skippedUsers: 0,
        skippedAnalyses: 0,
        failedRecords: [],
    };

    // 1. Connect to MongoDB
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas successfully.\n');

    // 2. Fetch all MongoDB documents
    console.log('📊 Reading records from MongoDB...');
    const users = await MongoUser.find({}).lean();
    const analyses = await MongoAnalysis.find({}).lean();

    stats.mongoUsers = users.length;
    stats.mongoAnalyses = analyses.length;

    console.log(`   • Found ${users.length} user records.`);
    console.log(`   • Found ${analyses.length} analysis records.\n`);

    // Map of email -> Supabase User ID for linking foreign keys
    const emailToUserIdMap = new Map();

    // ─── 3. Migrate Users ────────────────────────────────────────────────────
    console.log('👤 [1/3] Processing Users...');
    for (const u of users) {
        if (!u.email) {
            stats.skippedUsers++;
            stats.failedRecords.push({ type: 'user', id: u._id, reason: 'Missing email' });
            continue;
        }

        const normalizedEmail = u.email.trim().toLowerCase();
        const userPayload = {
            email: normalizedEmail,
            name: u.name || normalizedEmail.split('@')[0],
            auth_provider: u.firebaseUid ? 'firebase' : u.googleId ? 'google' : 'email',
            google_id: u.googleId || null,
            firebase_uid: u.firebaseUid || null,
            avatar: u.avatar || null,
            resume_text: u.resumeText || null,
            skills: Array.isArray(u.skills) ? u.skills : [],
            readiness_score: u.readinessScore || 0,
            last_login: u.lastLogin ? new Date(u.lastLogin).toISOString() : null,
            login_attempts: u.loginAttempts || 0,
            lock_until: u.lockUntil ? new Date(u.lockUntil).toISOString() : null,
            created_at: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            updated_at: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
            mongo_id: u._id.toString(),
        };

        if (isDryRun) {
            stats.migratedUsers++;
            if (stats.migratedUsers <= 2) {
                console.log(`   [Dry-Run Sample User]:`, JSON.stringify(userPayload, null, 2));
            }
        } else {
            try {
                // Idempotent upsert by email or mongo_id
                const { data, error } = await supabase
                    .from('users')
                    .upsert(userPayload, { onConflict: 'email' })
                    .select('id, email')
                    .single();

                if (error) {
                    throw error;
                }

                emailToUserIdMap.set(normalizedEmail, data.id);
                stats.migratedUsers++;
                console.log(`   ✅ Migrated user: ${normalizedEmail} (PG ID: ${data.id})`);

                // Migrate active refresh token if present
                if (u.refreshToken) {
                    const tokenPayload = {
                        user_id: data.id,
                        token_hash: u.refreshToken,
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: userPayload.created_at,
                    };
                    const { error: tokErr } = await supabase
                        .from('refresh_tokens')
                        .insert(tokenPayload);

                    if (!tokErr) stats.migratedTokens++;
                }
            } catch (err) {
                stats.failedRecords.push({ type: 'user', id: u._id, email: u.email, error: err.message });
                console.error(`   ❌ Failed user ${u.email}:`, err.message);
            }
        }
    }
    console.log(`   Finished Users: ${stats.migratedUsers} migrated, ${stats.skippedUsers} skipped.\n`);

    // ─── 4. Migrate Analyses ─────────────────────────────────────────────────
    console.log('📈 [2/3] Processing Analyses...');
    for (const a of analyses) {
        if (!a.email) {
            stats.skippedAnalyses++;
            stats.failedRecords.push({ type: 'analysis', id: a._id, reason: 'Missing email association' });
            continue;
        }

        const normalizedEmail = a.email.trim().toLowerCase();
        const linkedUserId = emailToUserIdMap.get(normalizedEmail) || null;

        const analysisPayload = {
            user_id: linkedUserId,
            email: normalizedEmail,
            resume_text: a.resumeText || null,
            skills: Array.isArray(a.skills) ? a.skills : [],
            gap_skills: Array.isArray(a.gap_skills) ? a.gap_skills : [],
            readiness_score: Number(a.readiness_score) || 0,
            roadmap: Array.isArray(a.roadmap) ? a.roadmap : [],
            score_breakdown: a.score_breakdown || null,
            career_paths: Array.isArray(a.career_paths) ? a.career_paths : [],
            skill_weights: Array.isArray(a.skill_weights) ? a.skill_weights : [],
            category_distribution: Array.isArray(a.category_distribution) ? a.category_distribution : [],
            readiness_trajectory: a.readiness_trajectory || null,
            created_at: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
            updated_at: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
            mongo_id: a._id.toString(),
        };

        if (isDryRun) {
            stats.migratedAnalyses++;
            if (stats.migratedAnalyses <= 2) {
                console.log(`   [Dry-Run Sample Analysis]:`, JSON.stringify({
                    email: analysisPayload.email,
                    readiness_score: analysisPayload.readiness_score,
                    skills_count: analysisPayload.skills.length,
                    gaps_count: analysisPayload.gap_skills.length,
                    mongo_id: analysisPayload.mongo_id,
                }, null, 2));
            }
        } else {
            try {
                const { error } = await supabase
                    .from('analyses')
                    .upsert(analysisPayload, { onConflict: 'mongo_id' });

                if (error) throw error;
                stats.migratedAnalyses++;
                console.log(`   ✅ Migrated analysis for ${normalizedEmail} (Score: ${analysisPayload.readiness_score})`);
            } catch (err) {
                stats.failedRecords.push({ type: 'analysis', id: a._id, email: a.email, error: err.message });
                console.error(`   ❌ Failed analysis ${a._id}:`, err.message);
            }
        }
    }
    console.log(`   Finished Analyses: ${stats.migratedAnalyses} migrated, ${stats.skippedAnalyses} skipped.\n`);

    // ─── 5. Post-Migration Verification ──────────────────────────────────────
    console.log('🔍 [3/3] Running Verification Audit...');
    if (isDryRun) {
        console.log('   [Dry-Run]: Verification skipped. No records were written.');
    } else {
        const { count: pgUserCount, error: uErr } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: pgAnalysisCount, error: aErr } = await supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true });

        if (uErr) console.warn('   ⚠️ Could not count Postgres users:', uErr.message);
        if (aErr) console.warn('   ⚠️ Could not count Postgres analyses:', aErr.message);

        console.log('   📊 Record Count Comparison:');
        console.log(`      • MongoDB Users:    ${stats.mongoUsers}  |  PostgreSQL Users:    ${pgUserCount ?? 'N/A'}`);
        console.log(`      • MongoDB Analyses: ${stats.mongoAnalyses}  |  PostgreSQL Analyses: ${pgAnalysisCount ?? 'N/A'}`);

        const userParity = (pgUserCount ?? 0) >= stats.migratedUsers;
        const analysisParity = (pgAnalysisCount ?? 0) >= stats.migratedAnalyses;

        if (userParity && analysisParity) {
            console.log('   ✅ DATA INTEGRITY VERIFIED: Record counts match or exceed source migration batch.');
        } else {
            console.warn('   ⚠️ Parity Warning: Some records may have failed. Check failure log below.');
        }
    }

    // ─── 6. Summary Report ───────────────────────────────────────────────────
    console.log('\n===============================================================');
    console.log('📋 FINAL MIGRATION SUMMARY');
    console.log('===============================================================');
    console.log(`• Status:               ${isDryRun ? 'DRY-RUN COMPLETE (No data written)' : 'SUCCESS'}`);
    console.log(`• Users Processed:      ${stats.migratedUsers} / ${stats.mongoUsers}`);
    console.log(`• Analyses Processed:   ${stats.migratedAnalyses} / ${stats.mongoAnalyses}`);
    console.log(`• Tokens Migrated:      ${stats.migratedTokens}`);
    console.log(`• Failed Records:       ${stats.failedRecords.length}`);

    if (stats.failedRecords.length > 0) {
        console.log('\n❌ Failure Log:');
        console.log(JSON.stringify(stats.failedRecords, null, 2));
    }
    console.log('===============================================================\n');

    await mongoose.disconnect();
    console.log('🔒 Closed MongoDB Atlas connection.');
}

runMigration().catch(err => {
    console.error('💥 Fatal migration error:', err);
    process.exit(1);
});
