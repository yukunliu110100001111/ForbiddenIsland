// src/controllers/bindButtons.js
export function bindButtons(btns, setAct, clearUi) {
    /* — 常规操作按钮 — */
    btns.move  && (btns.move.onclick  = () => !window.isOverLimit && setAct('MOVE'));
    btns.shore && (btns.shore.onclick = () => !window.isOverLimit && setAct('SHORE_UP'));
    btns.take  && (btns.take.onclick  = () => !window.isOverLimit && setAct('COLLECT_TREASURE'));

    /* — 结束回合 — */
    if (btns.end) btns.end.onclick = async () => {
        if (window.isOverLimit) return;          // 超限不能结束
        clearUi();
        await window.api.sendAction({ action: 'END_TURN' });
        window.refreshGame?.();
    };


    /* — 重置 / 调试 — */
    if (btns.reset) btns.reset.onclick = async () => {
        clearUi();
        await window.api.resetGame();
        window.refreshGame?.();
    };
}
