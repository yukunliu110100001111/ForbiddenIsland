// controllers/controls.js
import * as api from '../api/inGameApi.js';

let currentAction = null;
let selectedCard   = null;

/** 暴露给高亮渲染用 */
export function getCurrentAction() {
    return currentAction;
}

/**
 * 绑定所有按钮和点击事件
 * @param {{move,shore,take,give,spec,end}} btns  — 各按钮 DOM
 * @param {Function} onRefresh                  — 完成操作后刷新页面的回调
 */
export function wireControls(btns, onRefresh) {
    currentAction = null;
    selectedCard   = null;

    // ----- 辅助函数 -----
    const clear = () => {
        currentAction = null;
        selectedCard   = null;
        // 清掉按钮高亮
        Object.values(btns).forEach(b => b?.classList.remove('active'));
        // 清掉手牌选中态
        document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
    };

    const setAct = act => {
        clear();
        currentAction = act;
        // 给对应按钮打高亮
        Object.entries(btns).forEach(([key, b]) => {
            if (!b) return;
            let active = false;
            if (act === 'MOVE'  && key === 'move') active = true;
            if (act === 'SHORE_UP'         && key === 'shore') active = true;
            if (act === 'COLLECT_TREASURE' && key === 'take')  active = true;
            if (act === 'GIVE_CARD'        && key === 'give')  active = true;
            b.classList.toggle('active', active);
        });
    };

    // ----- 按钮绑定 -----
    btns.move.onclick  = () => setAct('MOVE');
    btns.shore.onclick = () => setAct('SHORE_UP');
    btns.take.onclick  = () => setAct('COLLECT_TREASURE');
    if (btns.give)     btns.give.onclick  = () => setAct('GIVE_CARD');

    // “Special” 一般直接在后端执行特殊卡
    btns.spec.onclick = async () => {
        clear();
        await api.useSpecialAbility();
        onRefresh();
    };
    // “End Turn” 直接结算
    btns.end.onclick = async () => {
        clear();
        await api.sendAction({ action: 'END_TURN' });
        onRefresh();
    };

    // ----- 地图格子点击 -----
    document.getElementById('map-container')
        .addEventListener('click', async e => {
            if (!currentAction) return;
            const tile = e.target.closest('.tile');
            if (!tile) return;
            // 只有 MOVE / SHORE_UP / COLLECT_TREASURE 三种会走到这
            await api.sendAction({
                action: currentAction,
                x: +tile.dataset.x,
                y: +tile.dataset.y
            });
            clear();
            onRefresh();
        });

    // ----- 手牌点击：USE_CARD & GIVE_CARD -----
    document.getElementById('players-footer')
        .addEventListener('click', async e => {
            // 如果当前是使用卡片
            if (currentAction === 'USE_CARD') {
                const cardEl = e.target.closest('.card');
                if (!cardEl) return;
                const cardId = cardEl.dataset.cardId;
                await api.sendAction({ action: 'USE_CARD', cardId: +cardId });
                clear();
                onRefresh();
            }
            // 如果当前是赠送卡片：先选牌，再点玩家
            else if (currentAction === 'GIVE_CARD') {
                // 点击手牌：选中牌
                const cardEl = e.target.closest('.card');
                if (cardEl) {
                    selectedCard = +cardEl.dataset.cardId;
                    document.querySelectorAll('.card.selected')
                        .forEach(c => c.classList.remove('selected'));
                    cardEl.classList.add('selected');
                    return;
                }
                // 点击玩家头像：完成赠送
                const playerEl = e.target.closest('.player');
                if (playerEl && selectedCard != null) {
                    const targetIdx = +playerEl.dataset.playerIndex;
                    await api.sendAction({
                        action: 'GIVE_CARD',
                        cardId: selectedCard,
                        targetPlayer: targetIdx
                    });
                    clear();
                    onRefresh();
                }
            }
        });
}
