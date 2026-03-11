/**
 * mestrando.js - Mestrando Page Module
 * Handles the "Mestrando" (Game Master Dashboard) page.
 * Shows campaign list, stats, and quick actions.
 * All data operations are async (Supabase).
 */

const MestrandoPage = (() => {
    'use strict';

    const mainContent = document.getElementById('main-content');

    // --- Page Template ---
    function getTemplate(campaigns) {
        const totalSessions = campaigns.reduce((sum, c) => sum + (c.sessions || []).length, 0);
        const totalNPCs = campaigns.reduce((sum, c) => sum + (c.npcs || []).length, 0);
        const totalPlayers = campaigns.reduce((sum, c) => sum + (c.players || []).length, 0);

        return `
            <section class="mestrando-hero" id="mestrando-hero">
                <div class="mestrando-hero__icon">🏰</div>
                <h2 class="mestrando-hero__title">Mestrando</h2>
                <p class="mestrando-hero__subtitle">
                    Seu painel de controle para gerenciar campanhas, sessões e aventuras épicas.
                </p>
            </section>

            <section class="mestrando-stats" id="mestrando-stats">
                <div class="card" style="--i: 0">
                    <div class="stat">
                        <div class="stat__value">${campaigns.length}</div>
                        <div class="stat__label">Campanhas</div>
                    </div>
                </div>
                <div class="card" style="--i: 1">
                    <div class="stat">
                        <div class="stat__value">${totalSessions}</div>
                        <div class="stat__label">Sessões</div>
                    </div>
                </div>
                <div class="card" style="--i: 2">
                    <div class="stat">
                        <div class="stat__value">${totalNPCs}</div>
                        <div class="stat__label">NPCs</div>
                    </div>
                </div>
                <div class="card" style="--i: 3">
                    <div class="stat">
                        <div class="stat__value">${totalPlayers}</div>
                        <div class="stat__label">Jogadores</div>
                    </div>
                </div>
            </section>

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
                        <h4 class="mestrando-action-card__title">Sessão</h4>
                        <p class="mestrando-action-card__desc">
                            Gerencie e registre suas sessões de jogo.
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

            <section class="mestrando-campanhas" id="mestrando-campanhas">
                <div class="section-header">
                    <h3 class="section-header__title">Minhas Campanhas</h3>
                    <p class="section-header__subtitle">Suas campanhas salvas. Clique para abrir.</p>
                </div>
                ${campaigns.length > 0
                    ? `<div class="mestrando-campanhas__grid">
                        ${campaigns.map(c => getCampaignCard(c)).join('')}
                       </div>`
                    : `<div class="mestrando-campanhas__empty">
                        <div class="empty-state">
                            <div class="empty-state__icon">📜</div>
                            <h4 class="empty-state__title">Nenhuma campanha criada</h4>
                            <p class="empty-state__desc">Crie sua primeira campanha usando o botão acima!</p>
                        </div>
                       </div>`
                }
            </section>

            <section class="mestrando-npcs" id="mestrando-npcs">
                <div class="section-header">
                    <h3 class="section-header__title">Meus NPCs</h3>
                    <p class="section-header__subtitle">Todos os NPCs criados, organizados por campanha.</p>
                </div>
                ${getNpcsSectionContent(campaigns)}
            </section>
        `;
    }

    function getCampaignCard(campaign) {
        const name = campaign.name || 'Sem nome';
        const playersCount = (campaign.players || []).length;
        const sessionsCount = (campaign.sessions || []).length;
        const npcsCount = (campaign.npcs || []).length;
        const date = campaign.createdAt ? App.formatDate(new Date(campaign.createdAt)) : '';

        return `
            <div class="campanha-card" data-id="${campaign.id}">
                <div class="campanha-card__header">
                    <span class="campanha-card__icon">📜</span>
                    <div class="campanha-card__info">
                        <h4 class="campanha-card__name">${escapeHtml(name)}</h4>
                        ${date ? `<span class="campanha-card__date">Criada em ${date}</span>` : ''}
                    </div>
                </div>
                <div class="campanha-card__stats">
                    <span class="campanha-card__stat">🎭 ${playersCount} jogadores</span>
                    <span class="campanha-card__stat">📋 ${sessionsCount} sessões</span>
                    <span class="campanha-card__stat">🧙 ${npcsCount} NPCs</span>
                </div>
                <div class="campanha-card__actions">
                    <button class="btn btn--primary campanha-card__open" data-id="${campaign.id}">📂 Abrir</button>
                    <button class="btn btn--ghost campanha-card__delete" data-id="${campaign.id}" title="Excluir campanha">🗑️</button>
                </div>
            </div>
        `;
    }

    // --- NPC Section ---
    function getNpcsSectionContent(campaigns) {
        const campaignsWithNpcs = campaigns.filter(c => (c.npcs || []).length > 0);

        if (campaignsWithNpcs.length === 0) {
            return `
                <div class="mestrando-npcs__empty">
                    <div class="empty-state">
                        <div class="empty-state__icon">🧙</div>
                        <h4 class="empty-state__title">Nenhum NPC criado</h4>
                        <p class="empty-state__desc">Crie NPCs dentro das suas campanhas para vê-los aqui.</p>
                    </div>
                </div>
            `;
        }

        return campaignsWithNpcs.map(campaign => `
            <div class="mestrando-npcs__group">
                <div class="mestrando-npcs__group-header">
                    <span class="mestrando-npcs__group-icon">📜</span>
                    <h4 class="mestrando-npcs__group-title">${escapeHtml(campaign.name || 'Sem nome')}</h4>
                    <span class="mestrando-npcs__group-count">${campaign.npcs.length} NPC${campaign.npcs.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="mestrando-npcs__grid">
                    ${campaign.npcs.map(npc => getNpcCard(npc, campaign)).join('')}
                </div>
            </div>
        `).join('');
    }

    function getNpcCard(npc, campaign) {
        const name = escapeHtml(npc.name || 'Sem nome');
        const role = escapeHtml(npc.role || '');
        const location = escapeHtml(npc.location || '');
        const description = escapeHtml(npc.description || '');
        const shortDesc = description.length > 80 ? description.substring(0, 80) + '...' : description;

        return `
            <div class="mestrando-npc-card" data-campaign-id="${campaign.id}">
                <div class="mestrando-npc-card__avatar">🧙</div>
                <div class="mestrando-npc-card__body">
                    <div class="mestrando-npc-card__name">${name}</div>
                    ${role ? `<div class="mestrando-npc-card__role">${role}${location ? ' · ' + location : ''}</div>` : ''}
                    ${shortDesc ? `<div class="mestrando-npc-card__desc">${shortDesc}</div>` : ''}
                </div>
                <div class="mestrando-npc-card__footer">
                    <span class="mestrando-npc-card__badge">NPC</span>
                    <button class="btn btn--ghost mestrando-npc-card__link" data-campaign-id="${campaign.id}">📂 Ver na campanha</button>
                </div>
            </div>
        `;
    }

    // --- Render Page (async) ---
    async function render() {
        if (!mainContent) return;
        const campaigns = await App.loadCampaigns();
        mainContent.innerHTML = getTemplate(campaigns);
        bindEvents();
    }

    // --- Event Bindings ---
    function bindEvents() {
        document.querySelectorAll('.mestrando-action-card').forEach(card => {
            card.addEventListener('click', () => handleAction(card.id));
        });

        document.querySelectorAll('.campanha-card__open').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                App.navigateTo('nova-campanha', { id: btn.dataset.id });
            });
        });

        document.querySelectorAll('.campanha-card').forEach(card => {
            card.addEventListener('click', () => {
                App.navigateTo('nova-campanha', { id: card.dataset.id });
            });
        });

        document.querySelectorAll('.campanha-card__delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) {
                    await App.deleteCampaign(btn.dataset.id);
                    render();
                }
            });
        });

        // NPC card links
        document.querySelectorAll('.mestrando-npc-card__link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                App.navigateTo('nova-campanha', { id: btn.dataset.campaignId, tab: 'npcs' });
            });
        });

        document.querySelectorAll('.mestrando-npc-card').forEach(card => {
            card.addEventListener('click', () => {
                App.navigateTo('nova-campanha', { id: card.dataset.campaignId, tab: 'npcs' });
            });
        });
    }

    async function handleAction(actionId) {
        switch (actionId) {
            case 'action-new-campaign': {
                const name = prompt('Nome da nova campanha:');
                if (!name || !name.trim()) return;

                const campaign = {
                    id: App.generateId(),
                    name: name.trim(),
                    world: '',
                    players: [],
                    npcs: [],
                    classes: [],
                    weapons: [],
                    sessions: [],
                    createdAt: new Date().toISOString(),
                };
                await App.saveCampaign(campaign);
                App.navigateTo('nova-campanha', { id: campaign.id });
                break;
            }
            case 'action-new-session':
                App.navigateTo('nova-sessao');
                break;
            case 'action-create-npc': {
                const allCampaigns = await App.loadCampaigns();
                if (allCampaigns.length === 0) {
                    alert('Crie uma campanha primeiro para poder adicionar NPCs.');
                    return;
                }
                if (allCampaigns.length === 1) {
                    App.navigateTo('nova-campanha', { id: allCampaigns[0].id, tab: 'npcs' });
                } else {
                    const options = allCampaigns.map((c, i) => `${i + 1}. ${c.name || 'Sem nome'}`).join('\n');
                    const choice = prompt(`Selecione a campanha (número):\n${options}`);
                    const idx = parseInt(choice, 10) - 1;
                    if (idx >= 0 && idx < allCampaigns.length) {
                        App.navigateTo('nova-campanha', { id: allCampaigns[idx].id, tab: 'npcs' });
                    }
                }
                break;
            }
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, c => map[c]);
    }

    document.addEventListener('page:load', (e) => {
        if (e.detail.page === 'mestrando') {
            render();
        }
    });

    return { render };
})();
