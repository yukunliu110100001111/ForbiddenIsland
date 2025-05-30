// assets/js/renderers/waterMeterRenderer.js

/**
 * renderWaterMeter
 * 根据当前水位高亮水位表中的格子
 * @param {number} waterLevel       - 后端返回的水位整数，从 1 （Novice）到 N（ skull 以上 ）
 * @param {HTMLElement} container   - 承载 .level 子节点的容器
 */
export function renderWaterMeter(waterLevel, container) {
    const pointer = container.querySelector('.watermeter-pointer');
    // 水位越高，指针越靠上，自己调整这些常量
    const levelPositions = [180, 148, 116, 84, 52, 20]; // px: 对应6格Y坐标
    pointer.style.top = levelPositions[waterLevel - 1] + 'px';
}
