/**
 * app.js - Página do Mestre RPG
 * Core application logic and page routing.
 */

const App = (() => {
    'use strict';

    // --- State ---
    let currentPage = 'mestrando';

    // --- DOM References ---
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.navbar__link');

    // --- Navigation ---
    function navigateTo(pageName) {
        currentPage = pageName;

        // Update active link
        navLinks.forEach(link => {
            link.classList.toggle('navbar__link--active', link.dataset.page === pageName);
        });

        // Load the page
        loadPage(pageName);
    }

    function loadPage(pageName) {
        if (!mainContent) return;

        // Dispatch events for page modules to respond
        const event = new CustomEvent('page:load', { detail: { page: pageName } });
        document.dispatchEvent(event);
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

    // --- Initialization ---
    function init() {
        // Setup navigation click handlers
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) navigateTo(page);
            });
        });

        // Load default page
        navigateTo(currentPage);
    }

    // Boot when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        navigateTo,
        formatDate,
        generateId,
        debounce,
    };
})();
