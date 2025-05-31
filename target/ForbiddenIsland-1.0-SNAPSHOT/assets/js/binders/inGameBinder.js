// src/inGameBinder.js
import { pull } from '../state/gameStateStore.js';
import { renderTiles } from '../renderers/mapRenderer.js';
import { renderFooter } from '../renderers/footerRenderer.js';
import { renderAllHands } from '../renderers/handRenderer.js';
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
            end:   document.getElementById('btn-end-turn'),
            reset: document.getElementById('btn-reset')
        },
        modal:         document.getElementById('result-modal'),
        titleEl:       document.getElementById('result-title'),
        restart:       document.getElementById('btn-restart'),
        historyList:   document.getElementById('history-list'),
        actionLog:     document.getElementById('action-log')
    };

    const specialModal  = document.getElementById('special-modal');
    const specialListEl = document.getElementById('special-list');
    const specialClose  = document.getElementById('btn-special-close');

    // 取出本地存储的 myPlayerIndex
    const myPlayerIndex = parseInt(sessionStorage.getItem('myPlayerIndex') || '0', 10);
    console.log('bindInGame: myPlayerIndex =', myPlayerIndex);

    // 绑定按钮事件
    wireControls(dom.btns, refresh);

    // 首次渲染 & 定时刷新
    await refresh();
    const timer = setInterval(refresh, 2000);

    async function refresh() {
        gs = await pull();
        if (!gs) return;

        // 1. 渲染地图和高亮
        renderTiles(gs.board, gs.players, dom.mapLayer);
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves, gs.legalShores, gs.legalCaptures,
            dom.mapLayer
        );

        // 2. 渲染 footer（头像 + 空手牌容器）
        renderFooter(gs.players, gs.myPlayerIndex, gs.currentPlayerIndex, dom.footer);

        // 3. 渲染手牌（并传入 myPlayerIndex & isMyTurn）
        const isMyTurn = (gs.currentPlayerIndex === gs.myPlayerIndex);
        console.log(
            'bindInGame.refresh → currentPlayerIndex =', gs.currentPlayerIndex,
            ', myPlayerIndex =', gs.myPlayerIndex,
            ', isMyTurn =', isMyTurn
        );
        const allHands = gs.players.map(p => p.hand || []);
        renderAllHands(allHands, dom.footer, gs.myPlayerIndex, isMyTurn);

        // 4. 其它 UI
        renderWaterMeter(gs.waterLevel, document.getElementById('water-meter'));
        renderDeckCounts(gs.treasureDeckRemaining, gs.floodDeckRemaining);
        renderDrawnCards(gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards);
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress(gs.collectedTreasures, dom.progress);

        // 5. 按钮启停 & 状态栏文字
        const isMyTurnLocal = (gs.currentPlayerIndex === gs.myPlayerIndex);
        Object.values(dom.btns).forEach(btn => {
            if (btn) {
                btn.disabled = !isMyTurnLocal;
                btn.classList.remove('active');
            }
        });
        if (dom.status) {
            dom.status.textContent = isMyTurnLocal
                ? `Your turn！Remaining actions: ${gs.actionsLeft}`
                : `Waiting for player ${gs.currentPlayerIndex + 1}...`;
        }

        // 6. 历史记录 & 操作日志
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
        if (gs.logs && dom.actionLog) {
            dom.actionLog.innerHTML = gs.logs;
        }

        // 7. 胜负检测
        if ((gs.gameWon || gs.gameLost) && dom.modal && dom.titleEl) {
            dom.titleEl.textContent = gs.gameWon ? 'YOU WIN!' : 'GAME OVER';
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
