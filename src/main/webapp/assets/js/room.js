// room.js: 地图选择与房间启动逻辑
// 依赖：MAPS、MapManager 已在 maps.js 中定义

document.addEventListener('DOMContentLoaded', () => {
    // 初始化地图预览
    const preview = new MapManager(MapLoader, '#map-preview');
    preview.render(0);

    // 上一张地图
    document.getElementById('btn-map-prev')
        .addEventListener('click', () => preview.prev());

    // 下一张地图
    document.getElementById('btn-map-next')
        .addEventListener('click', () => preview.next());

    // 随机地图
    document.getElementById('btn-map-random')
        .addEventListener('click', () => {
            const randIndex = Math.floor(Math.random() * MapLoader.length);
            preview.render(randIndex);
        });

    // START GAME 按钮：保存选择并跳转
    document.getElementById('btn-room-start')
        .addEventListener('click', () => {
            sessionStorage.setItem('selectedMapIndex', preview.currentIndex);
            window.location.href = 'game.html';
        });
});
