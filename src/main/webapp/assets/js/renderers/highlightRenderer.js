/**
 * highlightRenderer.js
 * 负责根据当前选中行动和后端返回的合法目标坐标，高亮对应地图瓦片
 */
export function highlightTiles(
    action,            // 当前选中行动：'MOVE', 'SHORE' 或 'TAKE'
    legalMoves = [],   // [{x,y}, ...]
    legalShores = [],  // [{x,y}, ...]
    legalCaptures = [],// [{x,y}, ...]
    layer              // 地图区 DOM 容器
) {
    if (!layer) return;

    // 清除所有高亮
    layer.querySelectorAll('.tile').forEach(el => {
        el.classList.remove('highlight-move', 'highlight-shore', 'highlight-capture');
    });

    // 根据 action 选择对应的坐标数组和 css 类
    let coords = [];
    let cls = '';
    switch (action) {
        case 'MOVE':
            coords = legalMoves;
            cls = 'highlight-move';
            break;
        case 'SHORE':
            coords = legalShores;
            cls = 'highlight-shore';
            break;
        case 'TAKE':
            coords = legalCaptures;
            cls = 'highlight-capture';
            break;
        default:
            return; // 无选中行动，不高亮
    }

    // 为每个合法坐标的 tile 加上高亮类
    coords.forEach(({x, y}) => {
        const sel = layer.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
        if (sel) sel.classList.add(cls);
    });
}
