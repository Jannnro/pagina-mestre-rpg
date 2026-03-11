/**
 * nova-campanha.js - Campaign Page Module
 * Handles campaign editing with tabs for World, Sessions, Players, NPCs, Classes, Weapons.
 * Persists data via localStorage through App helpers.
 */

const NovaCampanhaPage = (() => {
    'use strict';

    const mainContent = document.getElementById('main-content');

    // --- Campaign State ---
    let campaignData = null;
    let activeTab = 'mundo';

    // --- Tabs Config ---
    const tabs = [
        { id: 'mundo',     icon: '🌍', label: 'Mundo',            countKey: null },
        { id: 'jogadores', icon: '🎭', label: 'Jogadores',        countKey: 'players' },
        { id: 'npcs',      icon: '🧙', label: 'NPCs Criados',     countKey: 'npcs' },
        { id: 'classes',   icon: '🛡️', label: 'Fichas de Classes', countKey: 'classes' },
        { id: 'armas',     icon: '⚔️', label: 'Fichas de Armas',   countKey: 'weapons' },
    ];

    // ==============================
    //  PERSISTENCE
    // ==============================
    async function save() {
        if (campaignData && campaignData.id) {
            await App.saveCampaign(campaignData);
        }
    }

    const autoSave = App.debounce(() => save(), 500);

    // ==============================
    //  MAIN TEMPLATE
    // ==============================
    function getTemplate() {
        if (!campaignData) return '<p>Campanha não encontrada.</p>';

        return `
            <!-- Page Header -->
            <div class="campanha-header">
                <button class="campanha-header__back" id="btn-back-mestrando" title="Voltar ao Mestrando">←</button>
                <div class="campanha-header__info">
                    <h2 class="campanha-header__title">${escapeHtml(campaignData.name)}</h2>
                    <p class="campanha-header__subtitle">Configure os detalhes da sua aventura épica.</p>
                </div>
            </div>

            <!-- Campaign Name -->
            <div class="campanha-name-section">
                <input
                    type="text"
                    id="campaign-name-input"
                    class="campanha-name-input"
                    placeholder="Nome da Campanha..."
                    maxlength="100"
                    value="${escapeHtml(campaignData.name)}"
                />
            </div>

            <!-- Tabs -->
            <div class="campanha-tabs" id="campanha-tabs">
                ${tabs.map(tab => `
                    <button class="campanha-tab ${tab.id === activeTab ? 'campanha-tab--active' : ''}"
                            data-tab="${tab.id}" id="tab-${tab.id}">
                        <span class="campanha-tab__icon">${tab.icon}</span>
                        ${tab.label}
                        ${tab.countKey ? `<span class="campanha-tab__count">${(campaignData[tab.countKey] || []).length}</span>` : ''}
                    </button>
                `).join('')}
            </div>

            <!-- Tab Content -->
            <div class="campanha-content" id="campanha-content">
                ${getTabContent(activeTab)}
            </div>
        `;
    }

    // ==============================
    //  TAB CONTENT TEMPLATES
    // ==============================
    function getTabContent(tabId) {
        switch (tabId) {
            case 'mundo':     return getMundoTemplate();
            case 'jogadores': return getJogadoresTemplate();
            case 'npcs':      return getListTemplate('npcs', 'NPCs Criados', '🧙', 'npc', campaignData.npcs);
            case 'classes':   return getClassesTemplate();
            case 'armas':     return getListTemplate('armas', 'Fichas de Armas', '⚔️', 'weapon', campaignData.weapons);
            default:          return '';
        }
    }

    // --- Mundo (World) Tab ---
    function getMundoTemplate() {
        return `
            <div class="mundo-section">
                <div class="section-header">
                    <h3 class="section-header__title">Sobre o Mundo</h3>
                    <p class="section-header__subtitle">Descreva o cenário, a história e as regras do seu mundo.</p>
                </div>

                <div class="mundo-editor">
                    <textarea
                        id="world-textarea"
                        class="mundo-editor__textarea"
                        placeholder="Descreva o mundo da sua campanha aqui...&#10;&#10;Exemplo: Em um continente devastado por guerras ancestrais, cinco reinos disputam o controle de artefatos mágicos que podem alterar o equilíbrio do poder..."
                        maxlength="10000"
                    >${escapeHtml(campaignData.world)}</textarea>
                    <span class="mundo-editor__count" id="world-char-count">${campaignData.world.length}/10000</span>
                </div>

                <div class="mundo-tips">
                    <div class="mundo-tip">
                        <div class="mundo-tip__icon">🗺️</div>
                        <div class="mundo-tip__title">Geografia</div>
                        <div class="mundo-tip__desc">Descreva os continentes, reinos, cidades e locais importantes.</div>
                    </div>
                    <div class="mundo-tip">
                        <div class="mundo-tip__icon">📖</div>
                        <div class="mundo-tip__title">História</div>
                        <div class="mundo-tip__desc">Conte os eventos passados que moldaram o mundo atual.</div>
                    </div>
                    <div class="mundo-tip">
                        <div class="mundo-tip__icon">⚡</div>
                        <div class="mundo-tip__title">Regras & Magia</div>
                        <div class="mundo-tip__desc">Defina o sistema de magia, divindades e leis do universo.</div>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Sessões Tab ---
    function getSessoesTemplate() {
        const sessions = campaignData.sessions || [];

        if (sessions.length === 0) {
            return `
                <div class="list-section">
                    <div class="list-section__toolbar">
                        <div class="section-header" style="margin-bottom:0">
                            <h3 class="section-header__title">Sessões</h3>
                        </div>
                        <button class="btn btn--primary" id="btn-add-sessao">
                            + Nova Sessão
                        </button>
                    </div>
                    <div class="empty-state">
                        <div class="empty-state__icon">📋</div>
                        <h4 class="empty-state__title">Nenhuma sessão criada</h4>
                        <p class="empty-state__desc">Crie sessões para registrar anotações e combates da campanha.</p>
                        <button class="btn btn--primary" id="btn-add-sessao-empty">
                            + Nova Sessão
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="list-section">
                <div class="list-section__toolbar">
                    <div class="section-header" style="margin-bottom:0">
                        <h3 class="section-header__title">Sessões</h3>
                    </div>
                    <button class="btn btn--primary" id="btn-add-sessao">
                        + Nova Sessão
                    </button>
                </div>
                <div class="items-grid items-grid--sessoes" id="grid-sessoes">
                    ${sessions.map((s, i) => getSessaoCard(s, i)).join('')}
                </div>
            </div>
        `;
    }

    function getSessaoCard(session, index) {
        const name = escapeHtml(session.name || 'Sessão sem nome');
        const date = session.createdAt ? App.formatDate(new Date(session.createdAt)) : '';
        const notesLen = (session.notes || '').length;
        const fightsLen = (session.fights || '').length;

        return `
            <div class="sessao-card item-card" data-index="${index}">
                <div class="sessao-card__header">
                    <span class="sessao-card__icon">📋</span>
                    <div class="sessao-card__info">
                        <div class="sessao-card__name">${name}</div>
                        ${date ? `<div class="sessao-card__date">${date}</div>` : ''}
                    </div>
                </div>
                <div class="sessao-card__stats">
                    <span class="sessao-card__stat">📝 ${notesLen > 0 ? notesLen + ' chars' : 'Sem anotações'}</span>
                    <span class="sessao-card__stat">⚔️ ${fightsLen > 0 ? fightsLen + ' chars' : 'Sem combates'}</span>
                </div>
                <div class="item-card__footer">
                    <button class="item-card__action" data-action="open-sessao" data-index="${index}">📂 Abrir</button>
                    <button class="item-card__action item-card__action--delete" data-action="delete-sessao" data-index="${index}">🗑️ Remover</button>
                </div>
            </div>
        `;
    }

    // --- Jogadores (Players) Tab ---
    function getJogadoresTemplate() {
        const items = campaignData.players;

        if (items.length === 0) {
            return `
                <div class="list-section">
                    <div class="list-section__toolbar">
                        <div class="section-header" style="margin-bottom:0">
                            <h3 class="section-header__title">Jogadores</h3>
                        </div>
                        <button class="btn btn--primary" id="btn-add-jogadores" data-type="jogadores">
                            + Adicionar Jogador
                        </button>
                    </div>
                    <div class="empty-state">
                        <div class="empty-state__icon">🎭</div>
                        <h4 class="empty-state__title">Nenhum jogador adicionado</h4>
                        <p class="empty-state__desc">Adicione os jogadores que participarão desta campanha.</p>
                        <button class="btn btn--primary" data-type="jogadores" data-action="add">
                            + Adicionar Jogador
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="list-section">
                <div class="list-section__toolbar">
                    <div class="list-section__search">
                        <span class="list-section__search-icon">🔍</span>
                        <input type="text" class="list-section__search-input"
                               placeholder="Buscar jogadores..."
                               id="search-jogadores" />
                    </div>
                    <button class="btn btn--primary" id="btn-add-jogadores" data-type="jogadores">
                        + Adicionar Jogador
                    </button>
                </div>
                <div class="items-grid items-grid--players" id="grid-jogadores">
                    ${items.map((item, index) => getPlayerCard(item, index)).join('')}
                </div>
            </div>
        `;
    }

    // --- Player Card (Dark Fantasy Sheet) ---
    function getPlayerCard(item, index) {
        const attrs = [
            { key: 'str', label: 'FOR' },
            { key: 'dex', label: 'DES' },
            { key: 'con', label: 'CON' },
            { key: 'int', label: 'INT' },
            { key: 'wis', label: 'SAB' },
            { key: 'cha', label: 'CAR' },
        ];

        const charName = escapeHtml(item.character || item.name || 'Sem nome');
        const race = escapeHtml(item.race || '');
        const domain = escapeHtml(item.domain || '');
        const level = escapeHtml(item.level || '1');
        const className = escapeHtml(item.class || 'Aventureiro');
        const conditions = escapeHtml(item.conditions || 'Nenhuma');
        const resistances = escapeHtml(item.resistances || 'Nenhuma');

        const attrValues = attrs.map(a => parseInt(item[a.key], 10) || 0);
        const maxAttr = Math.max(...attrValues);

        return `
            <div class="player-sheet item-card" data-index="${index}" data-type="jogadores">
                <div class="player-sheet__ornament-top"></div>

                <div class="player-sheet__name">${charName}</div>

                <div class="player-sheet__divider">
                    <span class="player-sheet__divider-icon">⚜</span>
                </div>

                ${race ? `<div class="player-sheet__race">${race}</div>` : ''}

                <div class="player-sheet__class-info">
                    ${domain ? `<div class="player-sheet__domain">${domain}</div>` : ''}
                    <div class="player-sheet__level">Nível ${level} ${className}</div>
                </div>

                <div class="player-sheet__stats">
                    ${attrs.map(attr => {
                        const val = parseInt(item[attr.key], 10) || 0;
                        const isHighlight = val > 0 && val >= maxAttr;
                        return `
                            <div class="player-sheet__stat ${isHighlight ? 'player-sheet__stat--highlight' : ''}">
                                <span class="player-sheet__stat-label">${attr.label}</span>
                                <span class="player-sheet__stat-value">${val}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="player-sheet__section">
                    <div class="player-sheet__section-divider">
                        <span class="player-sheet__section-title">Condições</span>
                    </div>
                    <div class="player-sheet__section-content">
                        ${conditions !== 'Nenhuma' ? `<span class="player-sheet__condition-badge">🌿 ${conditions}</span>` : `<span class="player-sheet__section-empty">Nenhuma</span>`}
                    </div>
                </div>

                <div class="player-sheet__section">
                    <div class="player-sheet__section-divider">
                        <span class="player-sheet__section-title">Resistências</span>
                    </div>
                    <div class="player-sheet__section-content">
                        <span class="player-sheet__section-empty">${resistances}</span>
                    </div>
                </div>

                <div class="player-sheet__ornament-bottom"></div>

                <div class="item-card__footer">
                    <button class="item-card__action" data-action="edit" data-type="jogadores" data-index="${index}">✏️ Editar</button>
                    <button class="item-card__action item-card__action--delete" data-action="delete" data-type="jogadores" data-index="${index}">🗑️ Remover</button>
                </div>
            </div>
        `;
    }

    // --- Classes (Fichas de Classes) Tab ---
    function getClassesTemplate() {
        const items = campaignData.classes;

        if (items.length === 0) {
            return `
                <div class="list-section">
                    <div class="list-section__toolbar">
                        <div class="section-header" style="margin-bottom:0">
                            <h3 class="section-header__title">Fichas de Classes</h3>
                        </div>
                        <button class="btn btn--primary" id="btn-add-classes" data-type="classes">
                            + Adicionar Classe
                        </button>
                    </div>
                    <div class="empty-state">
                        <div class="empty-state__icon">🛡️</div>
                        <h4 class="empty-state__title">Nenhuma ficha de classe</h4>
                        <p class="empty-state__desc">Crie fichas detalhadas com atributos para as classes disponíveis.</p>
                        <button class="btn btn--primary" data-type="classes" data-action="add">
                            + Adicionar Classe
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="list-section">
                <div class="list-section__toolbar">
                    <div class="list-section__search">
                        <span class="list-section__search-icon">🔍</span>
                        <input type="text" class="list-section__search-input"
                               placeholder="Buscar fichas de classes..."
                               id="search-classes" />
                    </div>
                    <button class="btn btn--primary" id="btn-add-classes" data-type="classes">
                        + Adicionar Classe
                    </button>
                </div>
                <div class="items-grid items-grid--classes" id="grid-classes">
                    ${items.map((item, index) => getClassCard(item, index)).join('')}
                </div>
            </div>
        `;
    }

    function getClassCard(item, index) {
        const attrs = [
            { key: 'forca',        label: 'Força',         icon: '💪' },
            { key: 'destreza',     label: 'Destreza',      icon: '🏹' },
            { key: 'inteligencia', label: 'Inteligência',  icon: '📖' },
            { key: 'presenca',     label: 'Presença',      icon: '✨' },
            { key: 'carisma',      label: 'Carisma',       icon: '💬' },
            { key: 'constituicao', label: 'Constituição',  icon: '🛡️' },
        ];

        return `
            <div class="class-card item-card" data-index="${index}" data-type="classes">
                <div class="class-card__header">
                    <div class="class-card__icon">🛡️</div>
                    <div class="class-card__title-area">
                        <div class="class-card__name">${escapeHtml(item.name || 'Sem nome')}</div>
                        <span class="badge badge--emerald">Classe</span>
                    </div>
                </div>

                <div class="class-card__vitals">
                    <div class="class-card__vital class-card__vital--hp">
                        <span class="class-card__vital-icon">❤️</span>
                        <span class="class-card__vital-label">HP</span>
                        <span class="class-card__vital-value">${escapeHtml(item.hp || '0')}/${escapeHtml(item.hpMax || '0')}</span>
                    </div>
                    <div class="class-card__vital class-card__vital--mana">
                        <span class="class-card__vital-icon">💎</span>
                        <span class="class-card__vital-label">Mana</span>
                        <span class="class-card__vital-value">${escapeHtml(item.mana || '0')}/${escapeHtml(item.manaMax || '0')}</span>
                    </div>
                </div>

                <div class="class-card__stats">
                    ${attrs.map(attr => `
                        <div class="class-card__stat">
                            <span class="class-card__stat-icon">${attr.icon}</span>
                            <span class="class-card__stat-label">${attr.label}</span>
                            <span class="class-card__stat-value ${getStatColor(item[attr.key])}">
                                ${formatStat(item[attr.key])}
                            </span>
                        </div>
                    `).join('')}
                </div>

                <div class="item-card__footer">
                    <button class="item-card__action" data-action="edit" data-type="classes" data-index="${index}">✏️ Editar</button>
                    <button class="item-card__action item-card__action--delete" data-action="delete" data-type="classes" data-index="${index}">🗑️ Remover</button>
                </div>
            </div>
        `;
    }

    function formatStat(value) {
        if (!value && value !== 0) return '+0';
        const num = parseInt(value, 10);
        if (isNaN(num)) return escapeHtml(String(value));
        return num >= 0 ? `+${num}` : `${num}`;
    }

    function getStatColor(value) {
        const num = parseInt(value, 10);
        if (isNaN(num)) return '';
        if (num >= 5) return 'stat-high';
        if (num >= 3) return 'stat-mid';
        return 'stat-low';
    }

    // --- Generic List Tab (NPCs, Weapons) ---
    function getListTemplate(type, title, icon, avatarType, items) {
        const configs = {
            npcs: {
                addLabel: 'Criar NPC',
                emptyIcon: '🧙',
                emptyTitle: 'Nenhum NPC criado',
                emptyDesc: 'Crie NPCs para enriquecer a narrativa da campanha.',
            },
            armas: {
                addLabel: 'Adicionar Arma',
                emptyIcon: '⚔️',
                emptyTitle: 'Nenhuma ficha de arma',
                emptyDesc: 'Crie fichas para as armas do seu mundo.',
            },
        };

        const config = configs[type];

        if (items.length === 0) {
            return `
                <div class="list-section">
                    <div class="list-section__toolbar">
                        <div class="section-header" style="margin-bottom:0">
                            <h3 class="section-header__title">${title}</h3>
                        </div>
                        <button class="btn btn--primary" id="btn-add-${type}" data-type="${type}">
                            + ${config.addLabel}
                        </button>
                    </div>
                    <div class="empty-state">
                        <div class="empty-state__icon">${config.emptyIcon}</div>
                        <h4 class="empty-state__title">${config.emptyTitle}</h4>
                        <p class="empty-state__desc">${config.emptyDesc}</p>
                        <button class="btn btn--primary" data-type="${type}" data-action="add">
                            + ${config.addLabel}
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="list-section">
                <div class="list-section__toolbar">
                    <div class="list-section__search">
                        <span class="list-section__search-icon">🔍</span>
                        <input type="text" class="list-section__search-input"
                               placeholder="Buscar ${title.toLowerCase()}..."
                               id="search-${type}" />
                    </div>
                    <button class="btn btn--primary" id="btn-add-${type}" data-type="${type}">
                        + ${config.addLabel}
                    </button>
                </div>
                <div class="items-grid" id="grid-${type}">
                    ${items.map((item, index) => getItemCard(item, index, type, avatarType)).join('')}
                </div>
            </div>
        `;
    }

    // --- Item Card ---
    function getItemCard(item, index, type, avatarType) {
        const iconMap = { npc: '🧙', weapon: '⚔️' };
        const detailMap = {
            npc: item.role ? `${item.role}${item.location ? ' • ' + item.location : ''}` : '',
            weapon: item.damage ? `Dano: ${item.damage}${item.weight ? ' • ' + item.weight : ''}` : '',
        };
        const badgeMap = {
            npc: { class: 'badge--gold', label: 'NPC' },
            weapon: { class: 'badge--crimson', label: 'Arma' },
        };
        const badge = badgeMap[avatarType];

        return `
            <div class="item-card" data-index="${index}" data-type="${type}">
                <div class="item-card__avatar item-card__avatar--${avatarType}">
                    ${iconMap[avatarType]}
                </div>
                <div class="item-card__body">
                    <div class="item-card__name">${escapeHtml(item.name || 'Sem nome')}</div>
                    <div class="item-card__detail">${escapeHtml(detailMap[avatarType] || '')}</div>
                    <div class="item-card__tags">
                        <span class="badge ${badge.class}">${badge.label}</span>
                        ${item.properties ? `<span class="badge badge--gold">${escapeHtml(item.properties)}</span>` : ''}
                    </div>
                </div>
                <div class="item-card__footer">
                    <button class="item-card__action" data-action="edit" data-type="${type}" data-index="${index}">✏️ Editar</button>
                    <button class="item-card__action item-card__action--delete" data-action="delete" data-type="${type}" data-index="${index}">🗑️ Remover</button>
                </div>
            </div>
        `;
    }

    // ==============================
    //  MODAL TEMPLATE
    // ==============================
    function getModalTemplate(title, type, fields, editIndex = null) {
        const isEdit = editIndex !== null;
        const existingData = isEdit ? getItemsArray(type)[editIndex] : {};

        return `
            <div class="modal-overlay" id="modal-overlay">
                <div class="modal">
                    <div class="modal__header">
                        <h3 class="modal__title">${isEdit ? 'Editar' : 'Adicionar'} ${title}</h3>
                        <button class="modal__close" id="modal-close">✕</button>
                    </div>
                    <form id="modal-form" data-type="${type}" data-index="${editIndex !== null ? editIndex : ''}">
                        ${fields.map(field => `
                            <div class="form-group">
                                <label class="form-label" for="field-${field.key}">${field.label}</label>
                                ${field.type === 'textarea'
                                    ? `<textarea id="field-${field.key}" class="form-input" rows="4"
                                          placeholder="${field.placeholder}"
                                          style="resize:vertical; min-height:100px">${escapeHtml(existingData[field.key] || '')}</textarea>`
                                    : `<input id="field-${field.key}" class="form-input"
                                          type="${field.type}" placeholder="${field.placeholder}"
                                          value="${escapeHtml(existingData[field.key] || '')}" />`
                                }
                            </div>
                        `).join('')}
                        <div class="modal__actions">
                            <button type="button" class="btn btn--secondary" id="modal-cancel">Cancelar</button>
                            <button type="submit" class="btn btn--primary">${isEdit ? 'Salvar' : 'Adicionar'}</button>
                        </div>
                    </form>
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
        const contentEl = document.getElementById('campanha-content');
        if (contentEl) {
            contentEl.innerHTML = getTabContent(activeTab);
            bindContentEvents();
        }
        updateTabCounts();
    }

    function updateTabCounts() {
        tabs.forEach(tab => {
            if (tab.countKey) {
                const countEl = document.querySelector(`#tab-${tab.id} .campanha-tab__count`);
                if (countEl) {
                    countEl.textContent = (campaignData[tab.countKey] || []).length;
                }
            }
        });
    }

    function bindEvents() {
        // Back button
        const backBtn = document.getElementById('btn-back-mestrando');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                save();
                App.navigateTo('mestrando');
            });
        }

        // Campaign name
        const nameInput = document.getElementById('campaign-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                campaignData.name = e.target.value;
                // Update header title live
                const titleEl = document.querySelector('.campanha-header__title');
                if (titleEl) titleEl.textContent = e.target.value || 'Nova Campanha';
                autoSave();
            });
        }

        // Tabs
        const tabButtons = document.querySelectorAll('.campanha-tab');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                tabButtons.forEach(b => b.classList.toggle('campanha-tab--active', b === btn));
                renderTabContent();
            });
        });

        bindContentEvents();
    }

    function bindContentEvents() {
        // World textarea
        const worldTA = document.getElementById('world-textarea');
        if (worldTA) {
            worldTA.addEventListener('input', (e) => {
                campaignData.world = e.target.value;
                const countEl = document.getElementById('world-char-count');
                if (countEl) countEl.textContent = `${e.target.value.length}/10000`;
                autoSave();
            });
        }

        // Session buttons
        const addSessaoBtn = document.getElementById('btn-add-sessao');
        const addSessaoEmptyBtn = document.getElementById('btn-add-sessao-empty');
        [addSessaoBtn, addSessaoEmptyBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => createSession());
            }
        });

        // Open session
        document.querySelectorAll('[data-action="open-sessao"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index, 10);
                const session = campaignData.sessions[index];
                if (session) {
                    save();
                    App.navigateTo('nova-sessao', { campaignId: campaignData.id, sessionIndex: index });
                }
            });
        });

        // Delete session
        document.querySelectorAll('[data-action="delete-sessao"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index, 10);
                if (index >= 0 && index < campaignData.sessions.length) {
                    campaignData.sessions.splice(index, 1);
                    save();
                    renderTabContent();
                }
            });
        });

        // Add buttons (generic items)
        document.querySelectorAll('[data-action="add"], [id^="btn-add-"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                if (type) openModal(type);
            });
        });

        // Edit buttons
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const index = parseInt(btn.dataset.index, 10);
                openModal(type, index);
            });
        });

        // Delete buttons
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const index = parseInt(btn.dataset.index, 10);
                deleteItem(type, index);
            });
        });

        // Search
        document.querySelectorAll('[id^="search-"]').forEach(input => {
            input.addEventListener('input', App.debounce((e) => {
                filterItems(e.target.id.replace('search-', ''), e.target.value);
            }, 200));
        });
    }

    // ==============================
    //  SESSION CREATION
    // ==============================
    function createSession() {
        const name = prompt('Nome da sessão:');
        if (!name || !name.trim()) return;

        if (!campaignData.sessions) campaignData.sessions = [];

        const session = {
            id: App.generateId(),
            name: name.trim(),
            notes: '',
            fights: '',
            createdAt: new Date().toISOString(),
        };

        campaignData.sessions.push(session);
        save();
        renderTabContent();
    }

    // ==============================
    //  MODAL LOGIC
    // ==============================
    function getFieldsConfig(type) {
        const configs = {
            jogadores: {
                title: 'Jogador',
                fields: [
                    { key: 'name', label: 'Nome do Jogador', type: 'text', placeholder: 'Ex: Pedro' },
                    { key: 'character', label: 'Nome do Personagem', type: 'text', placeholder: 'Ex: Thorin Escudo de Ferro' },
                    { key: 'race', label: 'Raça', type: 'text', placeholder: 'Ex: Meio-elfo Altaneiro' },
                    { key: 'class', label: 'Classe', type: 'text', placeholder: 'Ex: Guerreiro' },
                    { key: 'domain', label: 'Domínio / Subclasse', type: 'text', placeholder: 'Ex: Domínio da Luz' },
                    { key: 'level', label: 'Nível', type: 'number', placeholder: '1' },
                    { key: 'str', label: 'Força (FOR)', type: 'number', placeholder: 'Ex: 12' },
                    { key: 'dex', label: 'Destreza (DES)', type: 'number', placeholder: 'Ex: 14' },
                    { key: 'con', label: 'Constituição (CON)', type: 'number', placeholder: 'Ex: 13' },
                    { key: 'int', label: 'Inteligência (INT)', type: 'number', placeholder: 'Ex: 8' },
                    { key: 'wis', label: 'Sabedoria (SAB)', type: 'number', placeholder: 'Ex: 17' },
                    { key: 'cha', label: 'Carisma (CAR)', type: 'number', placeholder: 'Ex: 13' },
                    { key: 'conditions', label: 'Condições', type: 'text', placeholder: 'Ex: Bênção de Silvanus' },
                    { key: 'resistances', label: 'Resistências', type: 'text', placeholder: 'Ex: Nenhuma' },
                ],
            },
            npcs: {
                title: 'NPC',
                fields: [
                    { key: 'name', label: 'Nome do NPC', type: 'text', placeholder: 'Ex: Elara, a Sábia' },
                    { key: 'role', label: 'Papel', type: 'text', placeholder: 'Ex: Comerciante, Vilão, Aliado...' },
                    { key: 'location', label: 'Localização', type: 'text', placeholder: 'Ex: Taverna do Dragão Dourado' },
                    { key: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Aparência, personalidade, motivações...' },
                ],
            },
            classes: {
                title: 'Classe',
                fields: [
                    { key: 'name', label: 'Nome da Classe', type: 'text', placeholder: 'Ex: Guerreiro' },
                    { key: 'hp', label: 'HP (atual)', type: 'number', placeholder: 'Ex: 80' },
                    { key: 'hpMax', label: 'HP (máximo)', type: 'number', placeholder: 'Ex: 80' },
                    { key: 'mana', label: 'Mana (atual)', type: 'number', placeholder: 'Ex: 10' },
                    { key: 'manaMax', label: 'Mana (máximo)', type: 'number', placeholder: 'Ex: 10' },
                    { key: 'forca', label: 'Força', type: 'number', placeholder: 'Ex: 6' },
                    { key: 'destreza', label: 'Destreza', type: 'number', placeholder: 'Ex: 4' },
                    { key: 'inteligencia', label: 'Inteligência', type: 'number', placeholder: 'Ex: 1' },
                    { key: 'presenca', label: 'Presença', type: 'number', placeholder: 'Ex: 4' },
                    { key: 'carisma', label: 'Carisma', type: 'number', placeholder: 'Ex: 1' },
                    { key: 'constituicao', label: 'Constituição', type: 'number', placeholder: 'Ex: 5' },
                ],
            },
            armas: {
                title: 'Arma',
                fields: [
                    { key: 'name', label: 'Nome da Arma', type: 'text', placeholder: 'Ex: Espada Longa Élfica' },
                    { key: 'damage', label: 'Dano', type: 'text', placeholder: 'Ex: 1d8 + 2 cortante' },
                    { key: 'weight', label: 'Peso', type: 'text', placeholder: 'Ex: 1.5 kg' },
                    { key: 'properties', label: 'Propriedades', type: 'text', placeholder: 'Ex: Versátil, Mágica' },
                    { key: 'description', label: 'Descrição', type: 'textarea', placeholder: 'História, efeitos especiais...' },
                ],
            },
        };
        return configs[type];
    }

    function openModal(type, editIndex = null) {
        const config = getFieldsConfig(type);
        if (!config) return;

        const modalHtml = getModalTemplate(config.title, type, config.fields, editIndex);
        const container = document.createElement('div');
        container.id = 'modal-container';
        container.innerHTML = modalHtml;
        document.body.appendChild(container);

        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const form = document.getElementById('modal-form');

        const closeModal = () => { container.remove(); };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formType = form.dataset.type;
            const formIndex = form.dataset.index;
            const fieldsConfig = getFieldsConfig(formType);
            const data = {};

            fieldsConfig.fields.forEach(field => {
                const el = document.getElementById(`field-${field.key}`);
                if (el) data[field.key] = el.value.trim();
            });

            if (!data.name) {
                const nameField = document.getElementById('field-name');
                if (nameField) {
                    nameField.style.borderColor = 'var(--color-accent-crimson)';
                    nameField.focus();
                }
                return;
            }

            if (formIndex !== '') {
                const items = getItemsArray(formType);
                items[parseInt(formIndex, 10)] = { ...items[parseInt(formIndex, 10)], ...data };
            } else {
                getItemsArray(formType).push(data);
            }

            closeModal();
            save();
            renderTabContent();
        });

        const firstField = document.getElementById(`field-${config.fields[0].key}`);
        if (firstField) setTimeout(() => firstField.focus(), 100);
    }

    // ==============================
    //  DATA HELPERS
    // ==============================
    function getItemsArray(type) {
        const map = {
            jogadores: campaignData.players,
            npcs: campaignData.npcs,
            classes: campaignData.classes,
            armas: campaignData.weapons,
        };
        return map[type];
    }

    function deleteItem(type, index) {
        const items = getItemsArray(type);
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            save();
            renderTabContent();
        }
    }

    function filterItems(type, query) {
        const grid = document.getElementById(`grid-${type}`);
        if (!grid) return;
        const cards = grid.querySelectorAll('.item-card');
        const q = query.toLowerCase();
        cards.forEach(card => {
            const name = card.querySelector('.item-card__name, .player-sheet__name, .class-card__name')?.textContent.toLowerCase() || '';
            const detail = card.querySelector('.item-card__detail')?.textContent.toLowerCase() || '';
            const visible = name.includes(q) || detail.includes(q);
            card.style.display = visible ? '' : 'none';
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, c => map[c]);
    }

    // ==============================
    //  PAGE LIFECYCLE
    // ==============================
    document.addEventListener('page:load', async (e) => {
        if (e.detail.page === 'nova-campanha') {
            const params = e.detail.params || {};
            if (params.id) {
                campaignData = await App.getCampaignById(params.id);
            }
            if (!campaignData) {
                campaignData = {
                    id: App.generateId(),
                    name: 'Nova Campanha',
                    world: '',
                    players: [],
                    npcs: [],
                    classes: [],
                    weapons: [],
                    sessions: [],
                    createdAt: new Date().toISOString(),
                };
                await save();
            }
            activeTab = params.tab && tabs.some(t => t.id === params.tab) ? params.tab : 'mundo';
            render();
        }
    });

    return {
        render,
        getCampaignData: () => campaignData,
    };
})();
