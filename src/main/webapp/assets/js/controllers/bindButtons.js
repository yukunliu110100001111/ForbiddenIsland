// controls/bindButtons.js

export function bindButtons(btns, setAct, clearUi) {
    // 常规操作按钮：MOVE / SHORE_UP / COLLECT_TREASURE
    if (btns.move)  btns.move.onclick  = () => setAct('MOVE');
    if (btns.shore) btns.shore.onclick = () => setAct('SHORE_UP');
    if (btns.take)  btns.take.onclick  = () => setAct('COLLECT_TREASURE');

    // 结束回合：如果手牌超限，禁止结束
    if (btns.end) {
        btns.end.onclick = async () => {
            if (window.isOverLimit && window.gs.currentPlayerIndex === window.gs.myPlayerIndex) return;
            clearUi();
            await window.api.sendAction({ action: 'END_TURN' });
            window.refreshGame && window.refreshGame();
        };
    }
    // 重置游戏：永远可点
    if (btns.reset) {
        btns.reset.onclick = async () => {
            clearUi();
            await window.api.resetGame();
            window.refreshGame && window.refreshGame();
        };
    }
}
