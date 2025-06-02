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
import { wireControls } from '../controllers/controls.js';
import * as api from '../api/inGameApi.js';
window.api = api; // 确保 window.api 可用

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
            // use/give 两个按钮已去除，仅保留此处占位以防找不到
            end:   document.getElementById('btn-end-turn'),
            reset: document.getElementById('btn-reset')
        },
        modal:         document.getElementById('result-modal'),
        titleEl:       document.getElementById('result-title'),
        restart:       document.getElementById('btn-restart'),
        historyList:   document.getElementById('history-list'),
        actionLog:     document.getElementById('action-log')
    };

    const { getCurrentAction } = wireControls(dom.btns, refresh);

    // 绑定 Restart 按钮
    if (dom.restart) {
        dom.restart.onclick = async () => {
            sessionStorage.removeItem('myPlayerIndex');
            sessionStorage.removeItem('roomId');
            sessionStorage.removeItem('playerToken');
            sessionStorage.removeItem('gameStateCache');
            localStorage.removeItem('roomId');
            localStorage.removeItem('userName');
            window.location.href = '/ForbiddenIsland_war_exploded/';
        };
    }

    const myStoredIdx = sessionStorage.getItem('myPlayerIndex') || '0';
    const myPlayerIndex = parseInt(myStoredIdx, 10);

    // 绑定按钮 & 地图 & 拖拽
    wireControls(dom.btns, refresh);

    // 首次渲染 & 定时刷新
    await refresh();
    const timer = setInterval(refresh, 2000);

    async function refresh() {
        gs = await pull();
        if (!gs) return;

        // 同步本地玩家索引
        window.myPlayerIndex = gs.myPlayerIndex;
        // 提供刷新函数给 discardRenderer
        window.refreshGame = refresh;

        // 1. 渲染地图
        renderTiles(gs.board, gs.players, dom.mapLayer);
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves, gs.legalShores, gs.legalCaptures,
            dom.mapLayer
        );

        // 2. 渲染玩家区（头像 + 手牌容器空壳）
        renderFooter(gs.players, gs.myPlayerIndex, gs.currentPlayerIndex, dom.footer);

        // 3. 渲染所有手牌
        const isMyTurn = (gs.currentPlayerIndex === gs.myPlayerIndex);
        const allHands = gs.players.map(p => p.hand || []);
        renderAllHands(allHands, dom.footer, gs.myPlayerIndex, isMyTurn);

        // 4. 检测手牌超限 (>5)
        const myHandSize = allHands[gs.myPlayerIndex]?.length || 0;
        const overLimit = myHandSize > 5;
        window.isOverLimit = overLimit;

        // 清除旧的 .over-limit，再给超限玩家加上红框闪烁
        document.querySelectorAll('.player .hand').forEach(el => {
            el.classList.remove('over-limit');
        });
        if (overLimit) {
            const myHandContainer = dom.footer.querySelector(`.player[data-player-index="${gs.myPlayerIndex}"] .hand`);
            if (myHandContainer) myHandContainer.classList.add('over-limit');
        }

        // 如果是本地玩家回合且超限，则弹出“超限提示”（但不自动弃牌，玩家需拖拽）
        if (overLimit && isMyTurn) {
            // 这里只做提示，不阻塞 refresh 本身
            dom.status.textContent = `手牌超过5张，请先拖牌至“宝藏弃牌区”`;
        }

        // 5. 渲染其他 UI（如水位计 / 牌堆计数 / 弃牌堆...）
        renderWaterMeter(gs.waterLevel, document.getElementById('water-meter'));
        renderDeckCounts(gs.treasureDeckRemaining, gs.floodDeckRemaining);
        renderDrawnCards(gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards);
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress(gs.collectedTreasures, dom.progress);

        // 6. 按钮启停 & 状态栏文字
        const isMyTurnLocal = isMyTurn;
        Object.entries(dom.btns).forEach(([key, btn]) => {
            if (!btn) return;
            // “move/shore/take/end” 4个按钮，如果当前轮到且不超限则启用，否则禁用
            const actionBtns = ['move', 'shore', 'take', 'end'];
            if (actionBtns.includes(key)) {
                btn.disabled = overLimit || !isMyTurnLocal;
            } else {
                // reset 始终可点
                btn.disabled = false;
            }
            btn.classList.remove('active'); // 清除高亮（下一次点击才重置）
        });
        if (!overLimit && dom.status) {
            dom.status.textContent = isMyTurnLocal
                ? `Your turn！Remaining actions: ${gs.actionsLeft}`
                : `Waiting for player ${gs.currentPlayerIndex + 1}...`;
        }

        // 7. 历史记录 & 操作日志
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

        // 8. 胜负检测
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
