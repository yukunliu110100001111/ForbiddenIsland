// assets/js/mapLoader.js

// 定义经典 Forbidden Island 布局：1 表示地块，0 表示空白
const layout = [
    [0,0,1,1,0,0],
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [1,1,1,1,1,1],
    [0,1,1,1,1,0],
    [0,0,1,1,0,0],
];

// 将布局扁平化为 demoTiles 数据结构，state 初始都设为 safe，name 可后续补充
const demoTiles = layout
    .flatMap(row => row.map(exists => ({
        exists: Boolean(exists),
        name:   '',      // 可替换为具体地块名称，例如 'Temple of the Sun'
        state:  exists ? 'safe' : ''
    })));

// 渲染函数：根据 tiles 数组生成 DOM
function renderTiles(tiles) {
    const grid = document.getElementById('tile-grid');
    grid.innerHTML = ''; // 清空旧内容
    tiles.forEach(t => {
        const div = document.createElement('div');
        div.className = t.exists ? `tile ${t.state}` : 'empty';
        if (t.exists && t.name) div.textContent = t.name;
        grid.appendChild(div);
    });
}

// 尝试从后端拉取地图数据，失败则回退到 demoTiles
document.addEventListener('DOMContentLoaded', () => {
    const root = window.APP_ROOT || '';
    fetch(`${root}/map`)
        .then(response => {
            if (!response.ok) throw new Error('Network response not ok');
            return response.json();
        })
        .then(data => renderTiles(data))
        .catch(err => {
            console.warn('Fetch /map failed, fallback to demoTiles', err);
            renderTiles(demoTiles);
        });
});
