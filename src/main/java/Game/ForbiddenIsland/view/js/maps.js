// css/game.js 或者单独的 js/maps.js

// 1) 预定义 5 张地图（6×6），示例用数字代表地块类型
const MAPS = [
    // 地图 1
    [
        [1, 1, 2, 2, 1, 1],
        [1, 3, 3, 3, 3, 1],
        [2, 3, 4, 4, 3, 2],
        [2, 3, 4, 4, 3, 2],
        [1, 3, 3, 3, 3, 1],
        [1, 1, 2, 2, 1, 1]
    ],
    // 地图 2
    [
        [null, 2, 2, 2, 2, null],
        [2, 3, 3, 3, 3, 2],
        [2, 3, 4, 4, 3, 2],
        [2, 3, 4, 4, 3, 2],
        [2, 3, 3, 3, 3, 2],
        [null, 2, 2, 2, 2, null]
    ],
    // 地图 3
    [
        [1, null, 2, 2, null, 1],
        [null, 3, 3, 3, 3, null],
        [2, 3, 4, 4, 3, 2],
        [2, 3, 4, 4, 3, 2],
        [null, 3, 3, 3, 3, null],
        [1, null, 2, 2, null, 1]
    ],
    // 地图 4
    [
        [null, null, 2, 2, null, null],
        [null, 3, 3, 3, 3, null],
        [2, 3, 4, 4, 3, 2],
        [2, 3, 4, 4, 3, 2],
        [null, 3, 3, 3, 3, null],
        [null, null, 2, 2, null, null]
    ],
    // 地图 5
    [
        [1, 1, 1, 1, 1, 1],
        [1, null, 3, 3, null, 1],
        [1, 3, 4, 4, 3, 1],
        [1, 3, 4, 4, 3, 1],
        [1, null, 3, 3, null, 1],
        [1, 1, 1, 1, 1, 1]
    ]
];

// 2) MapManager：管理当前地图索引，提供渲染与切换
class MapManager {
    constructor(maps, gridSelector = '#tile-grid') {
        this.maps = maps;
        this.grid = document.querySelector(gridSelector);
        this.currentIndex = 0;
    }

    // 获取某张地图数据（二维数组）
    getMap(index) {
        if (index < 0 || index >= this.maps.length) {
            console.warn(`地图索引 ${index} 超出范围，使用 0`);
            return this.maps[0];
        }
        return this.maps[index];
    }

    // 渲染指定地图到页面
    render(index = 0) {
        const mapData = this.getMap(index);
        this.grid.innerHTML = '';       // 先清空
        mapData.forEach(row => {
            row.forEach(cell => {
                const div = document.createElement('div');
                if (cell === null) {
                    div.classList.add('empty');
                } else {
                    div.classList.add('tile');
                    // 你可以根据 cell 不同赋予不同的类名或 data-type
                    div.dataset.type = `type-${cell}`;
                }
                this.grid.appendChild(div);
            });
        });
        this.currentIndex = index;
    }

    // 切换到下一张地图
    next() {
        const nextIdx = (this.currentIndex + 1) % this.maps.length;
        this.render(nextIdx);
    }

    // 切换到上一张地图
    prev() {
        const prevIdx = (this.currentIndex - 1 + this.maps.length) % this.maps.length;
        this.render(prevIdx);
    }
}

// maps.js: 定义 MAPS 和 MapManager（同此前版本），最后改为读取 sessionStorage
document.addEventListener('DOMContentLoaded', () => {
    const initial = parseInt(sessionStorage.getItem('selectedMapIndex'), 10) || 0;
    window.mapManager = new MapManager(MAPS, '#tile-grid');
    mapManager.render(initial);
});

