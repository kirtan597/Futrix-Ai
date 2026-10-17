import { supabase } from './client';
import { useAuth } from '../../store/useAuth';

/**
 * Initializes Supabase session refresh listener and keeps application auth state synchronized.
 * If a session is refreshed or expired by Supabase, the zustand auth store is updated automatically.
 */
export function initSupabaseAuthListener() {
    return supabase.auth.onAuthStateChange(async (event, session) => {
        const { setAuth, clearAuth, updateAccessToken } = useAuth.getState();

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session) {
                const user = session.user;
                const email = user.email || '';
                const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
                const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

                if (event === 'TOKEN_REFRESHED') {
                    updateAccessToken(session.access_token);
                } else {
                    setAuth(session.access_token, session.refresh_token || '', {
                        email,
                        name,
                        avatar,
                    });
                }
            }
        } else if (event === 'SIGNED_OUT') {
            clearAuth();
        }
    });
}

/**
 * Ensure active Supabase session is valid or refreshed.
 */
export async function getRefreshedSupabaseSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        return null;
    }
    return session;
}
