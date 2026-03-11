/**
 * supabase.js - Supabase Client & Data Access Layer
 * Provides async CRUD operations for campaigns using Supabase PostgreSQL.
 */

const DB = (() => {
    'use strict';

    // --- Supabase Config ---
    const SUPABASE_URL = 'https://zcnzndseyffgefyzhnms.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbnpuZHNleWZmZ2VmeXpobm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTYwMTMsImV4cCI6MjA4ODczMjAxM30.qgVlKETHdFU1rE6zzJkIqipj8IyesGzLqQqk392G6lI';

    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ==============================
    //  CAMPAIGN CRUD
    // ==============================

    /**
     * Load all campaigns from Supabase.
     * @returns {Promise<Array>} Array of campaign objects
     */
    async function loadCampaigns() {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Reconstruct campaign objects from DB rows
            return (data || []).map(row => ({
                id: row.id,
                name: row.name,
                createdAt: row.created_at,
                ...row.data,
            }));
        } catch (e) {
            console.error('[DB] Failed to load campaigns:', e);
            return [];
        }
    }

    /**
     * Get a single campaign by ID.
     * @param {string} id - Campaign ID
     * @returns {Promise<Object|null>} Campaign object or null
     */
    async function getCampaignById(id) {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                name: data.name,
                createdAt: data.created_at,
                ...data.data,
            };
        } catch (e) {
            console.error('[DB] Failed to get campaign:', e);
            return null;
        }
    }

    /**
     * Save (upsert) a campaign.
     * @param {Object} campaign - Campaign object
     */
    async function saveCampaign(campaign) {
        try {
            const { id, name, createdAt, ...rest } = campaign;

            const { error } = await supabase
                .from('campaigns')
                .upsert({
                    id: id,
                    name: name || 'Sem nome',
                    data: rest,
                    created_at: createdAt || new Date().toISOString(),
                }, { onConflict: 'id' });

            if (error) throw error;
        } catch (e) {
            console.error('[DB] Failed to save campaign:', e);
        }
    }

    /**
     * Delete a campaign by ID.
     * @param {string} id - Campaign ID
     */
    async function deleteCampaign(id) {
        try {
            const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (e) {
            console.error('[DB] Failed to delete campaign:', e);
        }
    }

    // Public API
    return {
        loadCampaigns,
        getCampaignById,
        saveCampaign,
        deleteCampaign,
    };
})();
