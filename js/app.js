/**
 * app.js - Main Application Module
 * Handles page navigation and exposes shared helpers.
 * Data operations delegate to DB (supabase.js) — all async.
 */

const App = (() => {
    'use strict';

    // --- DOM References ---
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.navbar__link');

    // --- Navigation State ---
    let currentPage = 'mestrando';
    let currentParams = {};

    // --- Navigation ---
    function navigateTo(page, params = {}) {
        currentPage = page;
        currentParams = params;

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.toggle('navbar__link--active', link.dataset.page === page);
        });

        // Dispatch page load event
        document.dispatchEvent(new CustomEvent('page:load', {
            detail: { page, params },
        }));
    }

    function getParams() {
        return currentParams;
    }

    // --- Utility Functions ---
    function formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    }

    function generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    function debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // --- Data Operations (async, delegated to DB/supabase.js) ---
    async function loadCampaigns() {
        return DB.loadCampaigns();
    }

    async function getCampaignById(id) {
        return DB.getCampaignById(id);
    }

    async function saveCampaign(campaign) {
        return DB.saveCampaign(campaign);
    }

    async function deleteCampaign(id) {
        return DB.deleteCampaign(id);
    }

    // --- Initialization ---
    function init() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) navigateTo(page);
            });
        });

        navigateTo(currentPage);
    }

    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        navigateTo,
        getParams,
        formatDate,
        generateId,
        debounce,
        loadCampaigns,
        getCampaignById,
        saveCampaign,
        deleteCampaign,
    };
})();
