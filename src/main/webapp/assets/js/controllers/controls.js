// controllers/controls.js
import * as api from '../api/inGameApi.js';

let currentAction = null;   // 当前按钮动作
let pendingCard   = null;   // GIVE_CARD –  已选中的 cardId

/* 提供给其它模块做高亮参考 */
export function getCurrentAction() { return currentAction; }

/**
 * 绑定所有控件
 * @param {Object}   btns      - 结构同 inGameBinder 传入：{move,shore,take,use,give,spec,end,reset}
 * @param {Function} onRefresh - 操作完成后重新拉取并刷新 UI
 */
export function wireControls(btns, onRefresh) {

    /* ---------- 小工具 ---------- */
    const clearUi = () => {
        currentAction = null;
        pendingCard   = null;
        document.querySelectorAll('.color-btn.active')
            .forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.card.selected')
            .forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.player.target')
            .forEach(p => p.classList.remove('target'));
    };

    const setAct = act => {
        clearUi();
        currentAction = act;
        const map = {
            MOVE:   'move',
            SHORE_UP: 'shore',
            COLLECT_TREASURE: 'take',
            USE_CARD: 'use',
            GIVE_CARD: 'give',
        };
        Object.entries(btns).forEach(([k, b])=>{
            if (!b) return;
            b.classList.toggle('active', map[act] === k);
        });
    };

    /* ---------- 顶部按钮 ---------- */
    btns.move .onclick = () => setAct('MOVE');
    btns.shore.onclick = () => setAct('SHORE_UP');
    btns.take .onclick = () => setAct('COLLECT_TREASURE');
    if (btns.use)  btns.use .onclick = () => setAct('USE_CARD');
    if (btns.give) btns.give.onclick = () => setAct('GIVE_CARD');

    btns.spec.onclick = async () => {            // “Special”
        clearUi();
        await api.useSpecialAbility();
        onRefresh();
    };
    btns.end .onclick = async () => {            // “End Turn”
        clearUi();
        await api.sendAction({ action:'END_TURN' });
        onRefresh();
    };
    if (btns.reset) btns.reset.onclick = async ()=>{
        clearUi();
        await api.resetGame();
        onRefresh();
    };

    /* ---------- 地图点击（MOVE / SHORE_UP / COLLECT_TREASURE） ---------- */
    document.getElementById('map-container')
        .addEventListener('click', async ev=>{
            if (!currentAction) return;
            if (!['MOVE','SHORE_UP','COLLECT_TREASURE'].includes(currentAction)) return;
            const tile = ev.target.closest('.tile');
            if (!tile) return;
            await api.sendAction({
                action: currentAction,
                x: +tile.dataset.x,
                y: +tile.dataset.y
            });
            clearUi();
            onRefresh();
        });

    /* ---------- 左侧牌堆点击（抽牌） ---------- */
    document.getElementById('treasure-deck')
        ?.addEventListener('click', async ()=>{
            await api.sendAction({ action:'DRAW_TREASURE' });
            onRefresh();
        });
    document.getElementById('flood-deck')
        ?.addEventListener('click', async ()=>{
            await api.sendAction({ action:'DRAW_FLOOD' });
            onRefresh();
        });

    /* ---------- 底栏点击逻辑 ---------- */
    const footer = document.getElementById('players-footer');

    footer.addEventListener('click', async ev=>{
        /* 1) 手牌点击 ---------------------------------------------------- */
        const cardEl = ev.target.closest('.card');
        if (cardEl) {
            const cardId = +cardEl.dataset.cardId;

            // --- USE_CARD：直接打出 ---
            if (currentAction === 'USE_CARD') {
                await api.sendAction({ action:'USE_CARD', cardId });
                clearUi();
                return onRefresh();
            }

            // --- GIVE_CARD：第一步选牌 ---
            if (currentAction === 'GIVE_CARD') {
                pendingCard = cardId;
                // 视觉反馈
                document.querySelectorAll('.card.selected')
                    .forEach(c=>c.classList.remove('selected'));
                cardEl.classList.add('selected');
                return;          // 继续等待玩家点击头像
            }
        }

        /* 2) 玩家头像 / player 容器点击 ---------------------------------- */
        const playerEl = ev.target.closest('.player');
        if (playerEl && currentAction === 'GIVE_CARD' && pendingCard != null) {
            const targetIdx = +playerEl.dataset.playerIndex;
            // 视觉反馈
            document.querySelectorAll('.player.target')
                .forEach(p=>p.classList.remove('target'));
            playerEl.classList.add('target');

            await api.sendAction({
                action: 'GIVE_CARD',
                cardId: pendingCard,
                targetPlayer: targetIdx
            });
            clearUi();
            onRefresh();
        }
    });
}
