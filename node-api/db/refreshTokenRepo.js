const { supabase } = require('./supabaseClient');

/**
 * Store a newly issued refresh token
 */
async function storeRefreshToken(userId, token) {
    if (!userId || !token) return null;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('refresh_tokens')
        .insert({
            user_id: userId,
            token_hash: token,
            expires_at: expiresAt,
        })
        .select('*')
        .single();

    if (error) {
        console.warn(`[refreshTokenRepo.storeRefreshToken] Warning: ${error.message}`);
    }
    return data;
}

/**
 * Verify if refresh token is valid and not revoked/expired
 */
async function findValidToken(token) {
    if (!token) return null;

    const { data, error } = await supabase
        .from('refresh_tokens')
        .select('*')
        .eq('token_hash', token)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (error) {
        console.warn(`[refreshTokenRepo.findValidToken] ${error.message}`);
        return null;
    }
    return data;
}

/**
 * Revoke a specific refresh token (used during token rotation or logout)
 */
async function revokeToken(token) {
    if (!token) return false;

    const { error } = await supabase
        .from('refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_hash', token);

    if (error) {
        console.warn(`[refreshTokenRepo.revokeToken] ${error.message}`);
        return false;
    }
    return true;
}

/**
 * Revoke all active refresh tokens for a user (e.g. password reset / full logout)
 */
async function revokeAllUserTokens(userId) {
    if (!userId) return false;

    const { error } = await supabase
        .from('refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('revoked_at', null);

    if (error) {
        console.warn(`[refreshTokenRepo.revokeAllUserTokens] ${error.message}`);
        return false;
    }
    return true;
}

module.exports = {
    storeRefreshToken,
    findValidToken,
    revokeToken,
    revokeAllUserTokens,
};
