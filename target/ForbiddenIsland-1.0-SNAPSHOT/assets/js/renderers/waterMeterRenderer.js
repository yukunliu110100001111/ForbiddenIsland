// assets/js/renderers/waterMeterRenderer.js

/**
 * renderWaterMeter
 * 根据当前水位高亮水位表中的格子
 * @param {number} waterLevel       - 后端返回的水位整数，从 1 （Novice）到 N（ skull 以上 ）
 * @param {HTMLElement} container   - 承载 .level 子节点的容器
 */
/**
 * renderWaterMeter
 * 渲染水位表
 * @param {number} waterLevel     - 当前水位等级（1~6）
 * @param {HTMLElement} container - 水位表容器
 */
export function renderWaterMeter(waterLevel, container) {
    const pointer = container.querySelector('.watermeter-pointer');
    const label = container.querySelector('#watermeter-label');

    const levelPositions = [180, 148, 116, 84, 52, 20]; // 以 px 为单位的指针 top 值
    const maxLevel = levelPositions.length;

    if (waterLevel < 1 || waterLevel > maxLevel) {
        console.warn(`Invalid water level: ${waterLevel}`);
        return;
    }

    // 更新指针位置
    pointer.style.top = levelPositions[waterLevel - 1] + 'px';

    // 更新文字
    label.textContent = `${waterLevel} / ${maxLevel}`;
}

