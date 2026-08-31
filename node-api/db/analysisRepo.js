const { supabase } = require('./supabaseClient');

/**
 * Format PostgreSQL analysis row into standard application Analysis object
 * Preserves exact backward-compatible field names and shape
 */
function formatAnalysis(row, includeResumeText = false) {
    if (!row) return null;

    const formatted = {
        id: row.id,
        _id: row.id,
        user_id: row.user_id,
        email: row.email,
        skills: Array.isArray(row.skills) ? row.skills : [],
        gap_skills: Array.isArray(row.gap_skills) ? row.gap_skills : [],
        readiness_score: Number(row.readiness_score) || 0,
        roadmap: Array.isArray(row.roadmap) ? row.roadmap : [],
        score_breakdown: row.score_breakdown || null,
        career_paths: Array.isArray(row.career_paths) ? row.career_paths : [],
        skill_weights: Array.isArray(row.skill_weights) ? row.skill_weights : [],
        category_distribution: Array.isArray(row.category_distribution) ? row.category_distribution : [],
        readiness_trajectory: row.readiness_trajectory || null,
        createdAt: row.created_at ? new Date(row.created_at) : null,
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        mongoId: row.mongo_id,
    };

    if (includeResumeText && row.resume_text !== undefined) {
        formatted.resumeText = row.resume_text;
    }

    return formatted;
}

/**
 * Save new analysis record
 */
async function createAnalysis(data) {
    const email = (data.email || '').trim().toLowerCase();
    const payload = {
        user_id: data.user_id || data.userId || null,
        email,
        resume_text: data.resumeText || data.resume_text || null,
        skills: Array.isArray(data.skills) ? data.skills : [],
        gap_skills: Array.isArray(data.gap_skills) ? data.gap_skills : [],
        readiness_score: Number(data.readiness_score) || 0,
        roadmap: Array.isArray(data.roadmap) ? data.roadmap : [],
        score_breakdown: data.score_breakdown || null,
        career_paths: Array.isArray(data.career_paths) ? data.career_paths : [],
        skill_weights: Array.isArray(data.skill_weights) ? data.skill_weights : [],
        category_distribution: Array.isArray(data.category_distribution) ? data.category_distribution : [],
        readiness_trajectory: data.readiness_trajectory || null,
    };

    const { data: saved, error } = await supabase
        .from('analyses')
        .insert(payload)
        .select('*')
        .single();

    if (error) throw new Error(`[analysisRepo.createAnalysis] ${error.message}`);
    return formatAnalysis(saved, false);
}

/**
 * Fetch analysis history scoped to authenticated user email
 */
async function findHistoryByEmail(email, limit = 20) {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();

    const { data, error } = await supabase
        .from('analyses')
        .select('id, user_id, email, skills, gap_skills, readiness_score, roadmap, score_breakdown, career_paths, skill_weights, category_distribution, readiness_trajectory, created_at, updated_at')
        .eq('email', normalized)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(`[analysisRepo.findHistoryByEmail] ${error.message}`);
    return (data || []).map(row => formatAnalysis(row, false));
}

/**
 * Find analysis by ID (UUID or mongo_id)
 */
async function findById(id) {
    if (!id) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('analyses').select('*');
    if (isUuid) {
        query = query.eq('id', id);
    } else {
        query = query.eq('mongo_id', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`[analysisRepo.findById] ${error.message}`);
    return formatAnalysis(data, false);
}

module.exports = {
    createAnalysis,
    findHistoryByEmail,
    findById,
    formatAnalysis,
};
