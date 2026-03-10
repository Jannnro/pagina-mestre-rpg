/**
 * mestrando.js - Mestrando Page Module
 * Handles the "Mestrando" (Game Master Dashboard) page.
 */

const MestrandoPage = (() => {
    'use strict';

    const mainContent = document.getElementById('main-content');

    // --- Page Template ---
    function getTemplate() {
        return `
            <!-- Hero Section -->
            <section class="mestrando-hero" id="mestrando-hero">
                <div class="mestrando-hero__icon">🏰</div>
                <h2 class="mestrando-hero__title">Mestrando</h2>
                <p class="mestrando-hero__subtitle">
                    Seu painel de controle para gerenciar campanhas, sessões e aventuras épicas.
                </p>
            </section>

            <!-- Dashboard Stats -->
            <section class="mestrando-stats" id="mestrando-stats">
                <div class="card" style="--i: 0">
                    <div class="stat">
                        <div class="stat__value" id="stat-campaigns">0</div>
                        <div class="stat__label">Campanhas</div>
                    </div>
                </div>
                <div class="card" style="--i: 1">
                    <div class="stat">
                        <div class="stat__value" id="stat-sessions">0</div>
                        <div class="stat__label">Sessões</div>
                    </div>
                </div>
                <div class="card" style="--i: 2">
                    <div class="stat">
                        <div class="stat__value" id="stat-npcs">0</div>
                        <div class="stat__label">NPCs</div>
                    </div>
                </div>
                <div class="card" style="--i: 3">
                    <div class="stat">
                        <div class="stat__value" id="stat-maps">0</div>
                        <div class="stat__label">Mapas</div>
                    </div>
                </div>
            </section>

            <!-- Quick Actions -->
            <section class="mestrando-actions" id="mestrando-actions">
                <div class="section-header">
                    <h3 class="section-header__title">Ações Rápidas</h3>
                    <p class="section-header__subtitle">Acesse as principais ferramentas do mestre.</p>
                </div>
                <div class="mestrando-actions__grid">
                    <div class="mestrando-action-card" style="--i: 0" id="action-new-campaign">
                        <div class="mestrando-action-card__icon">📜</div>
                        <h4 class="mestrando-action-card__title">Nova Campanha</h4>
                        <p class="mestrando-action-card__desc">
                            Crie uma nova campanha e defina o cenário da aventura.
                        </p>
                    </div>
                    <div class="mestrando-action-card" style="--i: 1" id="action-new-session">
                        <div class="mestrando-action-card__icon">⚔️</div>
                        <h4 class="mestrando-action-card__title">Nova Sessão</h4>
                        <p class="mestrando-action-card__desc">
                            Planeje e registre uma nova sessão de jogo.
                        </p>
                    </div>
                    <div class="mestrando-action-card" style="--i: 2" id="action-create-npc">
                        <div class="mestrando-action-card__icon">🧙</div>
                        <h4 class="mestrando-action-card__title">Criar NPC</h4>
                        <p class="mestrando-action-card__desc">
                            Dê vida a novos personagens para sua história.
                        </p>
                    </div>
                </div>
            </section>

            <!-- Recent Activity -->
            <section class="mestrando-recent" id="mestrando-recent">
                <div class="section-header">
                    <h3 class="section-header__title">Atividade Recente</h3>
                    <p class="section-header__subtitle">Suas últimas ações e eventos.</p>
                </div>
                <div class="mestrando-recent__list" id="recent-list">
                    <div class="mestrando-recent__item" style="--i: 0">
                        <span class="mestrando-recent__item-icon">🗺️</span>
                        <div class="mestrando-recent__item-info">
                            <div class="mestrando-recent__item-title">Nenhuma atividade registrada</div>
                            <div class="mestrando-recent__item-meta">Comece criando sua primeira campanha!</div>
                        </div>
                        <span class="badge badge--gold mestrando-recent__item-badge">Novo</span>
                    </div>
                </div>
            </section>
        `;
    }

    // --- Render Page ---
    function render() {
        if (!mainContent) return;
        mainContent.innerHTML = getTemplate();
        animateStats();
        bindEvents();
    }

    // --- Animate Stat Counters ---
    function animateStats() {
        const stats = {
            'stat-campaigns': 0,
            'stat-sessions': 0,
            'stat-npcs': 0,
            'stat-maps': 0,
        };

        Object.entries(stats).forEach(([id, target]) => {
            const el = document.getElementById(id);
            if (el) {
                animateCounter(el, 0, target, 800);
            }
        });
    }

    function animateCounter(element, start, end, duration) {
        const range = end - start;
        if (range === 0) {
            element.textContent = end;
            return;
        }

        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            element.textContent = Math.floor(start + range * eased);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // --- Event Bindings ---
    function bindEvents() {
        const actionCards = document.querySelectorAll('.mestrando-action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const id = card.id;
                handleAction(id);
            });
        });
    }

    function handleAction(actionId) {
        switch (actionId) {
            case 'action-new-campaign':
                App.navigateTo('nova-campanha');
                break;
            case 'action-new-session':
                console.log('[Mestrando] Nova Sessão - em construção');
                break;
            case 'action-create-npc':
                console.log('[Mestrando] Criar NPC - em construção');
                break;
            default:
                console.log('[Mestrando] Ação desconhecida:', actionId);
        }
    }

    // --- Listen for page load events ---
    document.addEventListener('page:load', (e) => {
        if (e.detail.page === 'mestrando') {
            render();
        }
    });

    // Public API
    return {
        render,
    };
})();
