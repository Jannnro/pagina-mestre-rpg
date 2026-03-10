/**
 * nova-sessao.js - Sessão Page Module
 * Flow: Select Campaign → List/Create Sessions → Open Session (Notes, Fights, Player Sidebar)
 * Sessions are stored inside each campaign's data in Supabase (async).
 */

const NovaSessaoPage = (() => {
    'use strict';

    const mainContent = document.getElementById('main-content');

    // --- State ---
    let selectedCampaign = null;
    let currentSession = null;
    let activeTab = 'anotacoes';

    const tabs = [
        { id: 'anotacoes', icon: '📝', label: 'Anotações' },
        { id: 'fights',    icon: '⚔️', label: 'Fights' },
    ];

    const autoSave = App.debounce(async () => {
        if (selectedCampaign && currentSession) {
            await App.saveCampaign(selectedCampaign);
        }
    }, 500);

    // ==============================
    //  VIEW 1: CAMPAIGN SELECTOR
    // ==============================
    function getCampaignSelectorTemplate(campaigns) {
        return `
            <div class="sessao-header">
                <button class="sessao-header__back" id="btn-back-mestrando" title="Voltar ao Mestrando">←</button>
                <div class="sessao-header__info">
                    <h2 class="sessao-header__title">Sessões</h2>
                    <p class="sessao-header__subtitle">Selecione uma campanha para gerenciar suas sessões.</p>
                </div>
            </div>

            ${campaigns.length > 0
                ? `<div class="sessao-campaign-grid">
                    ${campaigns.map(c => {
                        const sessCount = (c.sessions || []).length;
                        const playersCount = (c.players || []).length;
                        return `
                            <div class="sessao-campaign-card" data-id="${c.id}">
                                <div class="sessao-campaign-card__icon">📜</div>
                                <div class="sessao-campaign-card__info">
                                    <div class="sessao-campaign-card__name">${escapeHtml(c.name || 'Sem nome')}</div>
                                    <div class="sessao-campaign-card__meta">
                                        📋 ${sessCount} sessão(ões) · 🎭 ${playersCount} jogadores
                                    </div>
                                </div>
                                <span class="sessao-campaign-card__arrow">→</span>
                            </div>
                        `;
                    }).join('')}
                   </div>`
                : `<div class="empty-state">
                    <div class="empty-state__icon">📜</div>
                    <h4 class="empty-state__title">Nenhuma campanha criada</h4>
                    <p class="empty-state__desc">Crie uma campanha primeiro para poder criar sessões.</p>
                   </div>`
            }
        `;
    }

    // ==============================
    //  VIEW 2: SESSION LIST
    // ==============================
    function getSessionListTemplate() {
        const sessions = selectedCampaign.sessions || [];

        return `
            <div class="sessao-header">
                <button class="sessao-header__back" id="btn-back-campaigns" title="Voltar às campanhas">←</button>
                <div class="sessao-header__info">
                    <h2 class="sessao-header__title">${escapeHtml(selectedCampaign.name)}</h2>
                    <p class="sessao-header__subtitle">Sessões desta campanha</p>
                </div>
            </div>

            <div class="sessao-list-toolbar">
                <span class="sessao-list-toolbar__count">${sessions.length} sessão(ões)</span>
                <button class="btn btn--primary" id="btn-create-session">+ Nova Sessão</button>
            </div>

            ${sessions.length > 0
                ? `<div class="sessao-list-grid">
                    ${sessions.map((s, i) => getSessionCard(s, i)).join('')}
                   </div>`
                : `<div class="empty-state">
                    <div class="empty-state__icon">📋</div>
                    <h4 class="empty-state__title">Nenhuma sessão nesta campanha</h4>
                    <p class="empty-state__desc">Crie sua primeira sessão para começar a registrar a aventura.</p>
                    <button class="btn btn--primary" id="btn-create-session-empty">+ Nova Sessão</button>
                   </div>`
            }
        `;
    }

    function getSessionCard(session, index) {
        const name = escapeHtml(session.name || 'Sessão sem nome');
        const date = session.createdAt ? App.formatDate(new Date(session.createdAt)) : '';
        const notesLen = (session.notes || '').length;
        const fightsLen = (session.fights || '').length;

        return `
            <div class="sessao-list-card" data-index="${index}">
                <div class="sessao-list-card__header">
                    <span class="sessao-list-card__icon">📋</span>
                    <div class="sessao-list-card__info">
                        <div class="sessao-list-card__name">${name}</div>
                        ${date ? `<div class="sessao-list-card__date">${date}</div>` : ''}
                    </div>
                </div>
                <div class="sessao-list-card__stats">
                    <span class="sessao-list-card__stat">📝 ${notesLen > 0 ? notesLen + ' chars' : 'Sem anotações'}</span>
                    <span class="sessao-list-card__stat">⚔️ ${fightsLen > 0 ? fightsLen + ' chars' : 'Sem combates'}</span>
                </div>
                <div class="sessao-list-card__actions">
                    <button class="btn btn--primary sessao-list-card__open" data-index="${index}">📂 Abrir</button>
                    <button class="btn btn--ghost sessao-list-card__delete" data-index="${index}" title="Excluir sessão">🗑️</button>
                </div>
            </div>
        `;
    }

    // ==============================
    //  VIEW 3: SESSION DETAIL
    // ==============================
    function getDetailTemplate() {
        const players = selectedCampaign.players || [];

        return `
            <div class="sessao-header">
                <button class="sessao-header__back" id="btn-back-list" title="Voltar à lista de sessões">←</button>
                <div class="sessao-header__info">
                    <h2 class="sessao-header__title">${escapeHtml(currentSession.name)}</h2>
                    <p class="sessao-header__subtitle">${escapeHtml(selectedCampaign.name)}</p>
                </div>
            </div>

            <div class="sessao-layout">
                <div class="sessao-main">
                    <div class="sessao-tabs" id="sessao-tabs">
                        ${tabs.map(tab => `
                            <button class="sessao-tab ${tab.id === activeTab ? 'sessao-tab--active' : ''}"
                                    data-tab="${tab.id}" id="sessao-tab-${tab.id}">
                                <span class="sessao-tab__icon">${tab.icon}</span>
                                ${tab.label}
                            </button>
                        `).join('')}
                    </div>
                    <div class="sessao-content" id="sessao-content">
                        ${getTabContent(activeTab)}
                    </div>
                </div>

                <aside class="sessao-sidebar">
                    <div class="sessao-sidebar__header">
                        <span class="sessao-sidebar__header-icon">🎭</span>
                        <h3 class="sessao-sidebar__title">Jogadores</h3>
                        <span class="sessao-sidebar__count">${players.length}</span>
                    </div>
                    <div class="sessao-sidebar__list">
                        ${players.length > 0
                            ? players.map((p, i) => getPlayerItem(p, i)).join('')
                            : `<div class="sessao-sidebar__empty">
                                    <span class="sessao-sidebar__empty-icon">👤</span>
                                    <p>Nenhum jogador.</p>
                                    <p class="sessao-sidebar__empty-hint">Adicione jogadores na campanha.</p>
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
        if (tabId === 'anotacoes') return getNotesTemplate();
        if (tabId === 'fights') return getFightsTemplate();
        return '';
    }

    function getNotesTemplate() {
        return `
            <div class="sessao-notes">
                <div class="sessao-notes__header">
                    <span class="sessao-notes__header-icon">📜</span>
                    <h3 class="sessao-notes__title">Anotações da Sessão</h3>
                </div>
                <div class="sessao-notes__editor">
                    <textarea id="sessao-notes-textarea" class="sessao-notes__textarea"
                        placeholder="Escreva suas anotações aqui...&#10;&#10;• O que aconteceu nesta sessão?&#10;• Decisões importantes dos jogadores&#10;• Eventos narrativos e reviravoltas&#10;• Notas para a próxima sessão..."
                        maxlength="50000">${escapeHtml(currentSession.notes || '')}</textarea>
                    <span class="sessao-notes__count" id="notes-char-count">${(currentSession.notes || '').length}/50000</span>
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
                    <textarea id="sessao-fights-textarea" class="sessao-fights__textarea"
                        placeholder="Registre os combates aqui...&#10;&#10;• Ordem de iniciativa&#10;• Ações dos jogadores e inimigos&#10;• Dano causado e recebido&#10;• Habilidades e magias utilizadas&#10;• Condições aplicadas..."
                        maxlength="50000">${escapeHtml(currentSession.fights || '')}</textarea>
                    <span class="sessao-fights__count" id="fights-char-count">${(currentSession.fights || '').length}/50000</span>
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
            { key: 'str', label: 'FOR' }, { key: 'dex', label: 'DES' },
            { key: 'con', label: 'CON' }, { key: 'int', label: 'INT' },
            { key: 'wis', label: 'SAB' }, { key: 'cha', label: 'CAR' },
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
                <div class="sessao-player-popover">
                    <div class="sessao-player-popover__ornament"></div>
                    <div class="sessao-player-popover__name">${charName}</div>
                    <div class="sessao-player-popover__divider"><span class="sessao-player-popover__divider-icon">⚜</span></div>
                    ${race ? `<div class="sessao-player-popover__race">${race}</div>` : ''}
                    <div class="sessao-player-popover__class-info">
                        ${domain ? `<div class="sessao-player-popover__domain">${domain}</div>` : ''}
                        <div class="sessao-player-popover__level">Nível ${level} ${className}</div>
                    </div>
                    <div class="sessao-player-popover__stats">
                        ${attrs.map(attr => {
                            const val = parseInt(player[attr.key], 10) || 0;
                            const hl = val > 0 && val >= maxAttr;
                            return `<div class="sessao-player-popover__stat ${hl ? 'sessao-player-popover__stat--highlight' : ''}">
                                <span class="sessao-player-popover__stat-label">${attr.label}</span>
                                <span class="sessao-player-popover__stat-value">${val}</span>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="sessao-player-popover__section">
                        <div class="sessao-player-popover__section-divider"><span class="sessao-player-popover__section-title">Condições</span></div>
                        <div class="sessao-player-popover__section-content">
                            ${conditions !== 'Nenhuma' ? `<span class="sessao-player-popover__condition-badge">🌿 ${conditions}</span>` : `<em>${conditions}</em>`}
                        </div>
                    </div>
                    <div class="sessao-player-popover__section">
                        <div class="sessao-player-popover__section-divider"><span class="sessao-player-popover__section-title">Resistências</span></div>
                        <div class="sessao-player-popover__section-content"><em>${resistances}</em></div>
                    </div>
                    <div class="sessao-player-popover__ornament"></div>
                </div>
            </div>
        `;
    }

    // ==============================
    //  RENDER
    // ==============================
    async function render() {
        if (!mainContent) return;

        if (currentSession) {
            mainContent.innerHTML = getDetailTemplate();
            bindDetailEvents();
        } else if (selectedCampaign) {
            mainContent.innerHTML = getSessionListTemplate();
            bindSessionListEvents();
        } else {
            const campaigns = await App.loadCampaigns();
            mainContent.innerHTML = getCampaignSelectorTemplate(campaigns);
            bindCampaignSelectorEvents();
        }
    }

    function renderTabContent() {
        const el = document.getElementById('sessao-content');
        if (el) { el.innerHTML = getTabContent(activeTab); bindContentEvents(); }
    }

    // --- Campaign Selector Events ---
    function bindCampaignSelectorEvents() {
        document.getElementById('btn-back-mestrando')?.addEventListener('click', () => App.navigateTo('mestrando'));

        document.querySelectorAll('.sessao-campaign-card').forEach(card => {
            card.addEventListener('click', async () => {
                selectedCampaign = await App.getCampaignById(card.dataset.id);
                if (selectedCampaign) {
                    if (!selectedCampaign.sessions) selectedCampaign.sessions = [];
                    render();
                }
            });
        });
    }

    // --- Session List Events ---
    function bindSessionListEvents() {
        document.getElementById('btn-back-campaigns')?.addEventListener('click', () => {
            selectedCampaign = null;
            render();
        });

        [document.getElementById('btn-create-session'), document.getElementById('btn-create-session-empty')].forEach(btn => {
            if (btn) btn.addEventListener('click', async () => {
                const name = prompt('Nome da sessão:');
                if (!name || !name.trim()) return;
                if (!selectedCampaign.sessions) selectedCampaign.sessions = [];
                selectedCampaign.sessions.push({
                    id: App.generateId(),
                    name: name.trim(),
                    notes: '',
                    fights: '',
                    createdAt: new Date().toISOString(),
                });
                await App.saveCampaign(selectedCampaign);
                render();
            });
        });

        document.querySelectorAll('.sessao-list-card__open').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openSession(parseInt(btn.dataset.index, 10));
            });
        });

        document.querySelectorAll('.sessao-list-card').forEach(card => {
            card.addEventListener('click', () => openSession(parseInt(card.dataset.index, 10)));
        });

        document.querySelectorAll('.sessao-list-card__delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Excluir esta sessão?')) {
                    const idx = parseInt(btn.dataset.index, 10);
                    selectedCampaign.sessions.splice(idx, 1);
                    await App.saveCampaign(selectedCampaign);
                    render();
                }
            });
        });
    }

    function openSession(index) {
        if (selectedCampaign.sessions && selectedCampaign.sessions[index]) {
            currentSession = selectedCampaign.sessions[index];
            activeTab = 'anotacoes';
            render();
        }
    }

    // --- Detail View Events ---
    function bindDetailEvents() {
        document.getElementById('btn-back-list')?.addEventListener('click', async () => {
            if (currentSession) await App.saveCampaign(selectedCampaign);
            currentSession = null;
            render();
        });

        document.querySelectorAll('.sessao-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                document.querySelectorAll('.sessao-tab').forEach(b => b.classList.toggle('sessao-tab--active', b === btn));
                renderTabContent();
            });
        });

        bindContentEvents();
    }

    function bindContentEvents() {
        const notesTA = document.getElementById('sessao-notes-textarea');
        if (notesTA) notesTA.addEventListener('input', (e) => {
            currentSession.notes = e.target.value;
            const c = document.getElementById('notes-char-count');
            if (c) c.textContent = `${e.target.value.length}/50000`;
            autoSave();
        });

        const fightsTA = document.getElementById('sessao-fights-textarea');
        if (fightsTA) fightsTA.addEventListener('input', (e) => {
            currentSession.fights = e.target.value;
            const c = document.getElementById('fights-char-count');
            if (c) c.textContent = `${e.target.value.length}/50000`;
            autoSave();
        });
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
            selectedCampaign = null;
            currentSession = null;
            activeTab = 'anotacoes';
            render();
        }
    });

    return { render };
})();
