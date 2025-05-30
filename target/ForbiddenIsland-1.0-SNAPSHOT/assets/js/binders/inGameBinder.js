import { pull } from '../state/gameStateStore.js';
import { renderTiles } from '../renderers/mapRenderer.js';
import { renderFooter } from '../renderers/footerRenderer.js';
import { renderAllHands, renderHand } from '../renderers/handRenderer.js';
import { renderWaterMeter } from '../renderers/waterMeterRenderer.js';
import { renderDeckCounts } from '../renderers/deckRenderer.js';
import { renderDrawnCards } from '../renderers/drawnCardsRenderer.js';
import { renderDiscardPiles } from '../renderers/discardRenderer.js';
import { renderTreasureProgress } from '../renderers/progressRenderer.js';
import { highlightTiles } from '../renderers/highlightRenderer.js';
import { wireControls, getCurrentAction } from '../controllers/controls.js';
import * as api from '../api/inGameApi.js';

export async function bindInGame() {
    let gs;

    // --- DOM 引用 ---
    const dom = {
        mapLayer:         document.getElementById('tiles-layer'),
        footer:           document.getElementById('players-footer'),
        playersFooter:    document.getElementById('players-footer'),
        status:           document.getElementById('action-status'),
        treasureCount:    document.getElementById('treasure-count'),
        floodCount:       document.getElementById('flood-count'),
        drawnCards:       document.getElementById('drawn-cards'),
        treasureDiscard:  document.getElementById('treasure-discard'),
        floodDiscard:     document.getElementById('flood-discard'),
        progress:         document.getElementById('treasure-progress'),
        btns: {
            move:  document.getElementById('btn-move'),
            shore: document.getElementById('btn-shore'),
            take:  document.getElementById('btn-take'),
            use:   document.getElementById('btn-use'),
            give:  document.getElementById('btn-give'),
            spec:  document.getElementById('btn-special'),
            end:   document.getElementById('btn-end-turn'),
            reset: document.getElementById('btn-reset')
        },
        modal:    document.getElementById('result-modal'),
        titleEl:  document.getElementById('result-title'),
        restart:  document.getElementById('btn-restart'),
        historyList: document.getElementById('history-list'),
        actionLog: document.getElementById('action-log')  // ✅ 新增：全局日志容器
    };

    const specialModal  = document.getElementById('special-modal');
    const specialListEl = document.getElementById('special-list');
    const specialClose  = document.getElementById('btn-special-close');

    if (dom.btns.reset) {
        dom.btns.reset.onclick = async () => {
            try {
                await api.resetGame();
                specialModal?.classList.add('hidden');
                dom.modal?.classList.add('hidden');
                await refresh();
            } catch (e) {
                console.error('resetGame 失败', e);
                alert('游戏重置失败，请重试');
            }
        };
    }

    if (dom.restart) {
        dom.restart.onclick = () => window.location.reload();
    }

    if (specialClose && specialModal) {
        specialClose.onclick = () => specialModal.classList.add('hidden');
    }

    const myPlayerIndex = parseInt(sessionStorage.getItem('myPlayerIndex') || '0', 10);

    if (dom.btns.spec && specialModal && specialListEl) {
        dom.btns.spec.onclick = () => {
            specialListEl.innerHTML = '';
            const hand = gs?.players?.[myPlayerIndex]?.hand || [];
            const specials = hand.filter(c => c.cardType === 'ACTION');
            if (specials.length === 0) {
                specialListEl.innerHTML = '<p>无可用特殊牌</p>';
            } else {
                specials.forEach(card => {
                    const btn = document.createElement('button');
                    btn.className = 'special-card-btn';
                    btn.textContent = card.cardName;
                    btn.onclick = async () => {
                        await api.sendAction({ action: card.cardName, cardId: card.cardId });
                        specialModal.classList.add('hidden');
                        await refresh();
                    };
                    specialListEl.appendChild(btn);
                });
            }
            specialModal.classList.remove('hidden');
        };
    }

    wireControls(dom.btns, refresh);
    await refresh();
    const timer = setInterval(refresh, 1000);

    async function refresh() {
        gs = await pull();
        if (!gs) return;

        renderTiles(gs.board, gs.players, dom.mapLayer);
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves, gs.legalShores, gs.legalCaptures,
            dom.mapLayer
        );

        renderFooter(gs.players, gs.myPlayerIndex, gs.currentPlayerIndex, dom.footer);
        renderHand(gs.players?.[gs.myPlayerIndex]?.hand || [], dom.hand);
        renderAllHands(gs.players.map(p => p.hand), dom.playersFooter);
        renderWaterMeter(gs.waterLevel, document.getElementById('water-meter'));
        renderDeckCounts(gs.treasureDeckRemaining, gs.floodDeckRemaining, 28, 24);
        renderDrawnCards(gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards);
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress(gs.collectedTreasures, dom.progress);

        const isMyTurn = gs.currentPlayerIndex === gs.myPlayerIndex;
        Object.values(dom.btns).forEach(btn => {
            if (btn) {
                btn.disabled = !isMyTurn;
                btn.classList.remove('active');
            }
        });
        if (dom.status) {
            dom.status.textContent = isMyTurn
                ? `你的回合，剩余行动：${gs.actionsLeft}`
                : `等待 玩家${gs.currentPlayerIndex + 1} 操作`;
        }

        if (dom.historyList && Array.isArray(gs.history)) {
            dom.historyList.innerHTML = '';
            gs.history.slice(-50).forEach(entry => {
                const el = document.createElement('div');
                el.className = 'history-entry';
                el.textContent =
                    `[${formatTime(entry.ts)}] ${entry.player} ${entry.action}${entry.detail ? ' - ' + entry.detail : ''}`;
                dom.historyList.appendChild(el);
            });
            dom.historyList.scrollTop = dom.historyList.scrollHeight;
        }

        ////////////////////////////////////////////////////////////////////////////
        // ✅ 插入全局日志
        if (gs.logs && dom.actionLog) {
            dom.actionLog.innerHTML = gs.logs;
        }
        ////////////////////////////////////////////////////////////////

        if ((gs.gameWon || gs.gameLost) && dom.modal && dom.titleEl) {
            dom.titleEl.textContent = gs.gameWon ? 'You Win!' : 'Game Over';
            dom.modal.classList.remove('hidden');
            clearInterval(timer);
        }
    }

    function formatTime(ts) {
        if (!ts) return '';
        const d = new Date(ts * 1000);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
}
