const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(
    SUPABASE_URL &&
    SUPABASE_KEY &&
    !SUPABASE_URL.includes('placeholder') &&
    SUPABASE_URL.startsWith('http')
);

if (!isConfigured) {
    console.info('ℹ️ [Database] Running with in-memory relational PostgreSQL store (Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY for remote Supabase).');
}

// Live Supabase Client
const realSupabase = isConfigured
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
    : null;

// ─── High-Fidelity In-Memory Store (for local dev / tests without remote DB) ──
const memoryStore = {
    users: new Map(),
    refresh_tokens: new Map(),
    analyses: new Map(),
};

function createMemoryQueryBuilder(tableName) {
    const table = memoryStore[tableName] || (memoryStore[tableName] = new Map());

    return {
        _filters: [],
        _select: '*',
        _single: false,
        _maybeSingle: false,
        _order: null,
        _limit: null,

        select(fields = '*', options = {}) {
            this._select = fields;
            if (options.head) this._head = true;
            return this;
        },
        eq(col, val) {
            this._filters.push(row => row[col] === val);
            return this;
        },
        is(col, val) {
            this._filters.push(row => {
                if (val === null) {
                    return row[col] === null || row[col] === undefined;
                }
                return row[col] === val;
            });
            return this;
        },
        gt(col, val) {
            this._filters.push(row => {
                const a = row[col];
                if (!a) return false;
                return new Date(a).getTime() > new Date(val).getTime();
            });
            return this;
        },
        order(col, { ascending = true } = {}) {
            this._order = { col, ascending };
            return this;
        },
        limit(n) {
            this._limit = n;
            return this;
        },
        single() {
            this._single = true;
            return this._execute();
        },
        maybeSingle() {
            this._maybeSingle = true;
            return this._execute();
        },
        then(resolve, reject) {
            return this._execute().then(resolve, reject);
        },
        async _execute() {
            let rows = Array.from(table.values());

            for (const filter of this._filters) {
                rows = rows.filter(filter);
            }

            if (this._order) {
                const { col, ascending } = this._order;
                rows.sort((a, b) => {
                    const aVal = a[col] ? new Date(a[col]).getTime() || a[col] : a[col];
                    const bVal = b[col] ? new Date(b[col]).getTime() || b[col] : b[col];
                    if (aVal < bVal) return ascending ? -1 : 1;
                    if (aVal > bVal) return ascending ? 1 : -1;
                    return 0;
                });
            }

            if (this._limit !== null) {
                rows = rows.slice(0, this._limit);
            }

            if (this._head) {
                return { count: table.size, data: null, error: null };
            }

            if (this._single) {
                if (rows.length === 0) return { data: null, error: { message: 'Row not found' } };
                return { data: rows[0], error: null };
            }

            if (this._maybeSingle) {
                return { data: rows[0] || null, error: null };
            }

            return { data: rows, error: null };
        },
        insert(payload) {
            const records = Array.isArray(payload) ? payload : [payload];
            const inserted = records.map(p => {
                const id = p.id || crypto.randomUUID();
                const now = new Date().toISOString();
                const record = {
                    ...p,
                    id,
                    created_at: p.created_at || now,
                    updated_at: p.updated_at || now,
                };
                table.set(id, record);
                return record;
            });
            const res = Array.isArray(payload) ? inserted : inserted[0];

            return {
                select: () => ({
                    single: async () => ({ data: res, error: null }),
                    maybeSingle: async () => ({ data: res, error: null }),
                    then: (resolve, reject) => Promise.resolve({ data: res, error: null }).then(resolve, reject),
                }),
                single: async () => ({ data: res, error: null }),
                maybeSingle: async () => ({ data: res, error: null }),
                then: (resolve, reject) => Promise.resolve({ data: res, error: null }).then(resolve, reject),
            };
        },
        upsert(payload, options = {}) {
            const onConflict = options.onConflict || 'id';
            let existingKey = null;

            for (const [id, row] of table.entries()) {
                if (row[onConflict] === payload[onConflict]) {
                    existingKey = id;
                    break;
                }
            }

            const id = existingKey || payload.id || crypto.randomUUID();
            const now = new Date().toISOString();
            const record = {
                ...(existingKey ? table.get(existingKey) : {}),
                ...payload,
                id,
                updated_at: now,
                created_at: existingKey ? table.get(existingKey).created_at : (payload.created_at || now),
            };

            table.set(id, record);

            return {
                select: () => ({
                    single: async () => ({ data: record, error: null }),
                    maybeSingle: async () => ({ data: record, error: null }),
                    then: (resolve, reject) => Promise.resolve({ data: record, error: null }).then(resolve, reject),
                }),
                single: async () => ({ data: record, error: null }),
                maybeSingle: async () => ({ data: record, error: null }),
                then: (resolve, reject) => Promise.resolve({ data: record, error: null }).then(resolve, reject),
            };
        },
        update(updates) {
            const filters = [];
            const updateBuilder = {
                eq(col, val) {
                    filters.push(row => row[col] === val);
                    return this;
                },
                is(col, val) {
                    filters.push(row => {
                        if (val === null) {
                            return row[col] === null || row[col] === undefined;
                        }
                        return row[col] === val;
                    });
                    return this;
                },
                select() {
                    return {
                        single: async () => {
                            let updated = null;
                            for (const [id, row] of table.entries()) {
                                if (filters.every(f => f(row))) {
                                    updated = { ...row, ...updates, updated_at: new Date().toISOString() };
                                    table.set(id, updated);
                                    break;
                                }
                            }
                            return { data: updated, error: updated ? null : { message: 'Not found' } };
                        },
                        then: (resolve, reject) => {
                            let updated = null;
                            for (const [id, row] of table.entries()) {
                                if (filters.every(f => f(row))) {
                                    updated = { ...row, ...updates, updated_at: new Date().toISOString() };
                                    table.set(id, updated);
                                    break;
                                }
                            }
                            return Promise.resolve({ data: updated, error: null }).then(resolve, reject);
                        }
                    };
                },
                then(resolve, reject) {
                    for (const [id, row] of table.entries()) {
                        if (filters.every(f => f(row))) {
                            table.set(id, { ...row, ...updates, updated_at: new Date().toISOString() });
                        }
                    }
                    return Promise.resolve({ data: null, error: null }).then(resolve, reject);
                }
            };
            return updateBuilder;
        },
    };
}

const supabase = isConfigured
    ? realSupabase
    : {
        from: (tableName) => createMemoryQueryBuilder(tableName),
    };

/**
 * Health check helper to verify Supabase PostgreSQL connectivity
 * @returns {Promise<{ isConnected: boolean, error?: string }>}
 */
async function checkDbConnection() {
    if (!isConfigured) {
        return { isConnected: true, message: 'In-memory Relational Store (Dev/Local)' };
    }
    try {
        const { error } = await supabase
            .from('users')
            .select('id', { head: true, count: 'exact' });

        if (error) {
            return { isConnected: false, error: error.message };
        }
        return { isConnected: true };
    } catch (err) {
        return { isConnected: false, error: err.message };
    }
}

module.exports = {
    supabase,
    checkDbConnection,
    isConfigured,
};
