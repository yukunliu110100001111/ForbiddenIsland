// 获取整个游戏状态（含日志）的接口
async function fetchGameStateWithHistory() {
    const response = await fetch('/data?type=log_history');
    if (!response.ok) throw new Error('Network error');
    const gameState = await response.json(); // gameState.history 就是日志数组
    return gameState;
}
