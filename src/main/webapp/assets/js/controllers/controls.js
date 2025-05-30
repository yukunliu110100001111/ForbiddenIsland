// controllers/controls.js
import * as api from '../api/inGameApi.js';

let currentAction = null;

// 暴露给其他模块，用于渲染高亮
export function getCurrentAction() {
    return currentAction;
}

export function wireControls(btns, onRefresh) {
    currentAction = null;

    // 清除当前选择
    const clear = () => {
        currentAction = null;
        Object.values(btns).forEach(b => b.classList.remove('active'));
    };

    // 设置当前选择，并给对应按钮打高亮
    const setAct = act => {
        currentAction = act;
        Object.entries(btns).forEach(([key, b]) => {
            let isActive = false;
            if (act === 'MOVE' && key === 'move') isActive = true;
            if (act === 'SHORE_UP' && key === 'shore') isActive = true;
            if (act === 'COLLECT_TREASURE' && key === 'take') isActive = true;
            b.classList.toggle('active', isActive);
        });
    };

    // 点击按钮，先选中动作
    btns.move.onclick  = () => setAct('MOVE');
    btns.shore.onclick = () => setAct('SHORE_UP');
    btns.take.onclick  = () => setAct('COLLECT_TREASURE');

    // 特殊能力和结束回合 直接发请求
    btns.spec.onclick = async () => {
        clear();
        await api.useSpecialAbility();
        onRefresh();
    };
    btns.end.onclick = async () => {
        clear();
        await api.sendAction({ action: 'END_TURN' });
        onRefresh();
    };

    // 点击地图格子，发出 Move/ShoreUp/CollectTreasure 请求
    document.getElementById('map-container')
        .addEventListener('click', async e => {
            if (!currentAction) return;
            const tile = e.target.closest('.tile');
            if (!tile) return;
            await api.sendAction({
                action: currentAction,
                x: +tile.dataset.x,
                y: +tile.dataset.y
            });
            clear();
            onRefresh();
        });
}
