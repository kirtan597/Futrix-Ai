const { supabase } = require('./supabaseClient');

/**
 * Format PostgreSQL user row into standard application User object
 * Ensures full backward compatibility with Mongoose model shape (_id & id, camelCase)
 */
function formatUser(row) {
    if (!row) return null;
    const isLocked = Boolean(row.lock_until && new Date(row.lock_until).getTime() > Date.now());

    return {
        id: row.id,
        _id: row.id,
        email: row.email,
        name: row.name || row.email.split('@')[0],
        authProvider: row.auth_provider,
        googleId: row.google_id,
        firebaseUid: row.firebase_uid,
        avatar: row.avatar,
        resumeText: row.resume_text,
        skills: Array.isArray(row.skills) ? row.skills : [],
        readinessScore: Number(row.readiness_score) || 0,
        lastLogin: row.last_login ? new Date(row.last_login) : null,
        loginAttempts: row.login_attempts || 0,
        lockUntil: row.lock_until ? new Date(row.lock_until) : null,
        isLocked,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
        mongoId: row.mongo_id,
    };
}

/**
 * Find user by email
 */
async function findByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalized)
        .maybeSingle();

    if (error) throw new Error(`[userRepo.findByEmail] ${error.message}`);
    return formatUser(data);
}

/**
 * Find user by ID (UUID or mongo_id)
 */
async function findById(id) {
    if (!id) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query = supabase.from('users').select('*');
    if (isUuid) {
        query = query.eq('id', id);
    } else {
        query = query.eq('mongo_id', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`[userRepo.findById] ${error.message}`);
    return formatUser(data);
}

/**
 * Create a new user
 */
async function createUser(userData) {
    const email = (userData.email || '').trim().toLowerCase();
    const payload = {
        email,
        name: userData.name || email.split('@')[0],
        auth_provider: userData.authProvider || userData.auth_provider || 'email',
        google_id: userData.googleId || userData.google_id || null,
        firebase_uid: userData.firebaseUid || userData.firebase_uid || null,
        avatar: userData.avatar || null,
        last_login: new Date().toISOString(),
        login_attempts: 0,
    };

    const { data, error } = await supabase
        .from('users')
        .insert(payload)
        .select('*')
        .single();

    if (error) throw new Error(`[userRepo.createUser] ${error.message}`);
    return formatUser(data);
}

/**
 * Update user by ID
 */
async function updateUser(id, updates) {
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.firebaseUid !== undefined) payload.firebase_uid = updates.firebaseUid;
    if (updates.googleId !== undefined) payload.google_id = updates.googleId;
    if (updates.lastLogin !== undefined) payload.last_login = updates.lastLogin ? new Date(updates.lastLogin).toISOString() : null;
    if (updates.loginAttempts !== undefined) payload.login_attempts = updates.loginAttempts;
    if (updates.lockUntil !== undefined) payload.lock_until = updates.lockUntil ? new Date(updates.lockUntil).toISOString() : null;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.readinessScore !== undefined) payload.readiness_score = updates.readinessScore;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from('users').update(payload);

    if (isUuid) {
        query = query.eq('id', id);
    } else {
        query = query.eq('mongo_id', id);
    }

    const { data, error } = await query.select('*').single();
    if (error) throw new Error(`[userRepo.updateUser] ${error.message}`);
    return formatUser(data);
}

/**
 * Increment failed login attempts and lock if max reached (5 attempts -> 2 hours lock)
 */
async function incLoginAttempts(user) {
    const currentAttempts = (user.loginAttempts || 0) + 1;
    const updates = { loginAttempts: currentAttempts };

    if (currentAttempts >= 5 && !user.isLocked) {
        updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }

    return updateUser(user.id, updates);
}

/**
 * Reset failed login attempts on successful login
 */
async function resetLoginAttempts(userId) {
    return updateUser(userId, {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
    });
}

module.exports = {
    findByEmail,
    findById,
    createUser,
    updateUser,
    incLoginAttempts,
    resetLoginAttempts,
    formatUser,
};
