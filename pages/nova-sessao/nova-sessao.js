/**
 * nova-sessao.js - Nova Sessão Page Module
 * Handles the session page with Notes, Fights tabs, and player sidebar.
 */

const NovaSessaoPage = (() => {
    'use strict';

    const mainContent = document.getElementById('main-content');

    // --- Session State ---
    let sessionData = {
        notes: '',
        fights: '',
    };

    let activeTab = 'anotacoes';

    // --- Tabs Config ---
    const tabs = [
        { id: 'anotacoes', icon: '📝', label: 'Anotações' },
        { id: 'fights',    icon: '⚔️', label: 'Fights' },
    ];

    // --- Get Players from Campaign ---
    function getPlayers() {
        if (typeof NovaCampanhaPage !== 'undefined' && NovaCampanhaPage.getCampaignData) {
            return NovaCampanhaPage.getCampaignData().players || [];
        }
        return [];
    }

    // ==============================
    //  MAIN TEMPLATE
    // ==============================
    function getTemplate() {
        const players = getPlayers();

        return `
            <!-- Page Header -->
            <div class="sessao-header">
                <button class="sessao-header__back" id="btn-back-mestrando" title="Voltar ao Mestrando">←</button>
                <div class="sessao-header__info">
                    <h2 class="sessao-header__title">Nova Sessão</h2>
                    <p class="sessao-header__subtitle">Registre anotações, combates e acompanhe seus jogadores.</p>
                </div>
            </div>

            <!-- Main Layout: Content + Sidebar -->
            <div class="sessao-layout">
                <!-- Left: Tabs + Content -->
                <div class="sessao-main">
                    <!-- Tabs -->
                    <div class="sessao-tabs" id="sessao-tabs">
                        ${tabs.map(tab => `
                            <button class="sessao-tab ${tab.id === activeTab ? 'sessao-tab--active' : ''}"
                                    data-tab="${tab.id}" id="sessao-tab-${tab.id}">
                                <span class="sessao-tab__icon">${tab.icon}</span>
                                ${tab.label}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Tab Content -->
                    <div class="sessao-content" id="sessao-content">
                        ${getTabContent(activeTab)}
                    </div>
                </div>

                <!-- Right: Player Sidebar -->
                <aside class="sessao-sidebar">
                    <div class="sessao-sidebar__header">
                        <span class="sessao-sidebar__header-icon">🎭</span>
                        <h3 class="sessao-sidebar__title">Jogadores</h3>
                        <span class="sessao-sidebar__count">${players.length}</span>
                    </div>
                    <div class="sessao-sidebar__list" id="sessao-players-list">
                        ${players.length > 0
                            ? players.map((p, i) => getPlayerItem(p, i)).join('')
                            : `<div class="sessao-sidebar__empty">
                                    <span class="sessao-sidebar__empty-icon">👤</span>
                                    <p>Nenhum jogador criado.</p>
                                    <p class="sessao-sidebar__empty-hint">Crie jogadores na campanha primeiro.</p>
                               </div>`
                        }
                    </div>
                </aside>
            </div>
        `;
    }

    // ==============================
    //  TAB CONTENT
    // ==============================
    function getTabContent(tabId) {
        switch (tabId) {
            case 'anotacoes': return getNotesTemplate();
            case 'fights':    return getFightsTemplate();
            default:          return '';
        }
    }

    function getNotesTemplate() {
        return `
            <div class="sessao-notes">
                <div class="sessao-notes__header">
                    <span class="sessao-notes__header-icon">📜</span>
                    <h3 class="sessao-notes__title">Anotações da Sessão</h3>
                </div>
                <div class="sessao-notes__editor">
                    <textarea
                        id="sessao-notes-textarea"
                        class="sessao-notes__textarea"
                        placeholder="Escreva suas anotações da sessão aqui...&#10;&#10;• O que aconteceu nesta sessão?&#10;• Decisões importantes dos jogadores&#10;• Eventos narrativos e reviravoltas&#10;• Notas para a próxima sessão..."
                        maxlength="50000"
                    >${escapeHtml(sessionData.notes)}</textarea>
                    <span class="sessao-notes__count" id="notes-char-count">${sessionData.notes.length}/50000</span>
                </div>
            </div>
        `;
    }

    function getFightsTemplate() {
        return `
            <div class="sessao-fights">
                <div class="sessao-fights__header">
                    <span class="sessao-fights__header-icon">⚔️</span>
                    <h3 class="sessao-fights__title">Registro de Combate</h3>
                    <p class="sessao-fights__subtitle">Anote tudo o que está acontecendo durante as lutas.</p>
                </div>
                <div class="sessao-fights__editor">
                    <textarea
                        id="sessao-fights-textarea"
                        class="sessao-fights__textarea"
                        placeholder="Registre os combates aqui...&#10;&#10;• Ordem de iniciativa&#10;• Ações dos jogadores e inimigos&#10;• Dano causado e recebido&#10;• Habilidades e magias utilizadas&#10;• Condições aplicadas..."
                        maxlength="50000"
                    >${escapeHtml(sessionData.fights)}</textarea>
                    <span class="sessao-fights__count" id="fights-char-count">${sessionData.fights.length}/50000</span>
                </div>
            </div>
        `;
    }

    // ==============================
    //  PLAYER SIDEBAR ITEM + POPOVER
    // ==============================
    function getPlayerItem(player, index) {
        const charName = escapeHtml(player.character || player.name || 'Sem nome');
        const className = escapeHtml(player.class || 'Aventureiro');
        const level = escapeHtml(player.level || '1');
        const race = escapeHtml(player.race || '');
        const domain = escapeHtml(player.domain || '');
        const conditions = escapeHtml(player.conditions || 'Nenhuma');
        const resistances = escapeHtml(player.resistances || 'Nenhuma');

        const attrs = [
            { key: 'str', label: 'FOR' },
            { key: 'dex', label: 'DES' },
            { key: 'con', label: 'CON' },
            { key: 'int', label: 'INT' },
            { key: 'wis', label: 'SAB' },
            { key: 'cha', label: 'CAR' },
        ];

        const attrValues = attrs.map(a => parseInt(player[a.key], 10) || 0);
        const maxAttr = Math.max(...attrValues);

        return `
            <div class="sessao-player-item" data-index="${index}">
                <div class="sessao-player-item__main">
                    <span class="sessao-player-item__icon">🎭</span>
                    <div class="sessao-player-item__info">
                        <span class="sessao-player-item__name">${charName}</span>
                        <span class="sessao-player-item__class">Nv.${level} ${className}</span>
                    </div>
                </div>

                <!-- Popover with full player sheet -->
                <div class="sessao-player-popover">
                    <div class="sessao-player-popover__ornament"></div>

                    <div class="sessao-player-popover__name">${charName}</div>

                    <div class="sessao-player-popover__divider">
                        <span class="sessao-player-popover__divider-icon">⚜</span>
                    </div>

                    ${race ? `<div class="sessao-player-popover__race">${race}</div>` : ''}

                    <div class="sessao-player-popover__class-info">
                        ${domain ? `<div class="sessao-player-popover__domain">${domain}</div>` : ''}
                        <div class="sessao-player-popover__level">Nível ${level} ${className}</div>
                    </div>

                    <div class="sessao-player-popover__stats">
                        ${attrs.map(attr => {
                            const val = parseInt(player[attr.key], 10) || 0;
                            const isHighlight = val > 0 && val >= maxAttr;
                            return `
                                <div class="sessao-player-popover__stat ${isHighlight ? 'sessao-player-popover__stat--highlight' : ''}">
                                    <span class="sessao-player-popover__stat-label">${attr.label}</span>
                                    <span class="sessao-player-popover__stat-value">${val}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="sessao-player-popover__section">
                        <div class="sessao-player-popover__section-divider">
                            <span class="sessao-player-popover__section-title">Condições</span>
                        </div>
                        <div class="sessao-player-popover__section-content">
                            ${conditions !== 'Nenhuma' ? `<span class="sessao-player-popover__condition-badge">🌿 ${conditions}</span>` : `<em>${conditions}</em>`}
                        </div>
                    </div>

                    <div class="sessao-player-popover__section">
                        <div class="sessao-player-popover__section-divider">
                            <span class="sessao-player-popover__section-title">Resistências</span>
                        </div>
                        <div class="sessao-player-popover__section-content">
                            <em>${resistances}</em>
                        </div>
                    </div>

                    <div class="sessao-player-popover__ornament"></div>
                </div>
            </div>
        `;
    }

    // ==============================
    //  RENDER & EVENT BINDING
    // ==============================
    function render() {
        if (!mainContent) return;
        mainContent.innerHTML = getTemplate();
        bindEvents();
    }

    function renderTabContent() {
        const contentEl = document.getElementById('sessao-content');
        if (contentEl) {
            contentEl.innerHTML = getTabContent(activeTab);
            bindContentEvents();
        }
    }

    function bindEvents() {
        // Back button
        const backBtn = document.getElementById('btn-back-mestrando');
        if (backBtn) {
            backBtn.addEventListener('click', () => App.navigateTo('mestrando'));
        }

        // Tabs
        const tabButtons = document.querySelectorAll('.sessao-tab');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                tabButtons.forEach(b => b.classList.toggle('sessao-tab--active', b === btn));
                renderTabContent();
            });
        });

        bindContentEvents();
    }

    function bindContentEvents() {
        // Notes textarea
        const notesTA = document.getElementById('sessao-notes-textarea');
        if (notesTA) {
            notesTA.addEventListener('input', (e) => {
                sessionData.notes = e.target.value;
                const countEl = document.getElementById('notes-char-count');
                if (countEl) countEl.textContent = `${e.target.value.length}/50000`;
            });
        }

        // Fights textarea
        const fightsTA = document.getElementById('sessao-fights-textarea');
        if (fightsTA) {
            fightsTA.addEventListener('input', (e) => {
                sessionData.fights = e.target.value;
                const countEl = document.getElementById('fights-char-count');
                if (countEl) countEl.textContent = `${e.target.value.length}/50000`;
            });
        }
    }

    // ==============================
    //  UTILITY
    // ==============================
    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, c => map[c]);
    }

    // ==============================
    //  PAGE LIFECYCLE
    // ==============================
    document.addEventListener('page:load', (e) => {
        if (e.detail.page === 'nova-sessao') {
            render();
        }
    });

    return {
        render,
    };
})();
