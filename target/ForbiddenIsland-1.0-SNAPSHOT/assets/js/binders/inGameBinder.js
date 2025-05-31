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
        mapLayer:        document.getElementById('tiles-layer'),
        footer:          document.getElementById('players-footer'),
        status:          document.getElementById('action-status'),
        treasureCount:   document.getElementById('treasure-count'),
        floodCount:      document.getElementById('flood-count'),
        drawnCards:      document.getElementById('drawn-cards'),
        treasureDiscard: document.getElementById('treasure-discard'),
        floodDiscard:    document.getElementById('flood-discard'),
        progress:        document.getElementById('treasure-progress'),
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
        modal:         document.getElementById('result-modal'),
        titleEl:       document.getElementById('result-title'),
        restart:       document.getElementById('btn-restart'),
        historyList:   document.getElementById('history-list'),
        actionLog:     document.getElementById('action-log')
    };

    // 特殊牌弹窗
    const specialModal  = document.getElementById('special-modal');
    const specialListEl = document.getElementById('special-list');
    const specialClose  = document.getElementById('btn-special-close');

    // “重置游戏”按钮
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

    // “重新加载”按钮
    if (dom.restart) {
        dom.restart.onclick = () => window.location.reload();
    }

    // 关闭特殊牌弹窗
    if (specialClose && specialModal) {
        specialClose.onclick = () => specialModal.classList.add('hidden');
    }

    const myPlayerIndex = parseInt(sessionStorage.getItem('myPlayerIndex') || '0', 10);

    // 特殊牌弹窗逻辑
    if (dom.btns.spec && specialModal && specialListEl) {
        dom.btns.spec.onclick = () => {
            specialListEl.innerHTML = '';
            const hand = gs?.players?.[myPlayerIndex]?.hand || [];
            const specials = hand.filter(c => c.cardType === 'ACTION');
            if (!specials.length) {
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

    // 绑定移动/加固/抓宝/……等按钮 & 地图点击
    wireControls(dom.btns, refresh);

    // 首次渲染 & 定时刷新
    await refresh();
    const timer = setInterval(refresh, 3000);

    async function refresh() {
        gs = await pull();
        if (!gs) return;

        // 1. 地图 & 棋子
        renderTiles(gs.board, gs.players, dom.mapLayer);
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves, gs.legalShores, gs.legalCaptures,
            dom.mapLayer
        );

        // 2. 底栏：头像 + 手牌
        renderFooter(gs.players, gs.myPlayerIndex, gs.currentPlayerIndex, dom.footer);

        // 3. 其它 UI
        renderWaterMeter(gs.waterLevel, document.getElementById('water-meter'));
        renderDeckCounts(gs.treasureDeckRemaining, gs.floodDeckRemaining);
        renderDrawnCards(gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards);
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress(gs.collectedTreasures, dom.progress);

        // 4. 按钮启停 & 状态栏文字
        const isMyTurn = gs.currentPlayerIndex === gs.myPlayerIndex;
        Object.values(dom.btns).forEach(btn => {
            if (btn) {
                btn.disabled = !isMyTurn;
                btn.classList.remove('active');
            }
        });
        if (dom.status) {
            dom.status.textContent = isMyTurn
                ? `Your turn！Remaining actions:${gs.actionsLeft}`
                : `Waiting for player ${gs.currentPlayerIndex + 1} to operate...`;
        }


        if (dom.historyList && Array.isArray(gs.history)) {
            dom.historyList.innerHTML = '';
            gs.history.slice(-50).forEach(entry => {
                const el = document.createElement('div');
                el.className = 'history-entry';
                el.textContent =
                    `[${formatTime(entry.ts)}] player${entry.player + 1} ${entry.action}` +
                    (entry.detail ? ` - ${entry.detail}` : '');
                dom.historyList.appendChild(el);
            });
            dom.historyList.scrollTop = dom.historyList.scrollHeight;
        }

        // 6. 全局操作日志（例如自动化、服务端通知等）
        if (gs.logs && dom.actionLog) {
            dom.actionLog.innerHTML = gs.logs;
        }

        // 7. 胜负检测
        if ((gs.gameWon || gs.gameLost) && dom.modal && dom.titleEl) {
            dom.titleEl.textContent = gs.gameWon ? '你赢了！' : '游戏结束';
            dom.modal.classList.remove('hidden');
            clearInterval(timer);
        }
    }

    function formatTime(ts) {
        if (!ts) return '';
        const d = new Date(ts * 1000);
        return `${d.getHours().toString().padStart(2,'0')}:` +
            `${d.getMinutes().toString().padStart(2,'0')}`;
    }
}