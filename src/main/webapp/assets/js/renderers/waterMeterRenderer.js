/**
 * waterMeterRenderer.js
 * 负责根据当前水位（waterLevel）高亮右侧水位表的对应刻度
 */
export function renderWaterMeter(waterLevel, meterEl) {
    if (!meterEl) return;
    const levels = Array.from(meterEl.querySelectorAll('.level'));
    // levels: [💀, 5, 4, 3, 2, 'Novice']
    // 假设 waterLevel 对应数字层级：1→第(倒数2)个（‘2’），2→'3'，... 0→顶端（💀）
    // 具体映射可根据需求调整
    levels.forEach(el => el.classList.remove('active'));

    // 计算要高亮的索引
    // 索引从1到levels.length-2 依次对应水位1,2,...
    const maxLevel = levels.length - 2; // 5对应最高可抽
    let idx;
    if (waterLevel <= 0) {
        idx = 0; // skull
    } else if (waterLevel >= maxLevel) {
        idx = 1; // level '5'
    } else {
        // 例如 waterLevel=1 → levels.length-1-1 = idx=levels.length-2
        idx = levels.length - 1 - waterLevel;
    }

    if (levels[idx]) {
        levels[idx].classList.add('active');
    }
}
