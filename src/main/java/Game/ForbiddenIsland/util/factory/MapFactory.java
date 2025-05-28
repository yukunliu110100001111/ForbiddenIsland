package Game.ForbiddenIsland.util.factory;

import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Board.Tiles.TileImp;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;

public class MapFactory {
    public static GameMap loadMaps() throws Exception {
        String mapJsonPath  = "model/map_layout_classical.json";
        String tilesJsonPath = "model/tiles.json";

        System.out.println("[DEBUG] 尝试加载 tiles.json：" + tilesJsonPath);
        InputStream tilesStream = MapFactory.class.getClassLoader().getResourceAsStream(tilesJsonPath);
        if (tilesStream == null) throw new RuntimeException("tiles.json 文件找不到：" + tilesJsonPath);
        System.out.println("[DEBUG] tiles.json 已找到");

        ObjectMapper mapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addAbstractTypeMapping(Tile.class, TileImp.class);
        mapper.registerModule(module);

        List<Tile> tiles = mapper.readValue(tilesStream, new TypeReference<>() {});
        Collections.shuffle(tiles);

        System.out.println("[DEBUG] 尝试加载 map_layout_classical.json：" + mapJsonPath);
        InputStream mapStream = MapFactory.class.getClassLoader().getResourceAsStream(mapJsonPath);
        if (mapStream == null) throw new RuntimeException("map_layout_classical.json 文件找不到：" + mapJsonPath);
        System.out.println("[DEBUG] map_layout_classical.json 已找到");

        JsonNode mapRoot = mapper.readTree(mapStream);

        System.out.println("[DEBUG] 地图和 tile 文件全部加载完毕，准备 assignPositions");

        return new GameMap(assignPositions(tiles, mapRoot));
    }


    // 传 JsonNode，不再用文件路径
    private static Tile[][] assignPositions(List<Tile> tiles, JsonNode root) throws Exception {
        JsonNode positions = root.get("validPositions");
        int width = root.get("width").asInt();
        int height = root.get("height").asInt();

        if (positions == null || !positions.isArray()) {
            throw new IllegalArgumentException("JSON format error: validPositions should be array");
        }

        if (tiles.size() > positions.size()) {
            throw new IllegalArgumentException("lack of valid positions");
        }

        for (int i = 0; i < tiles.size(); i++) {
            JsonNode pair = positions.get(i);
            int x = pair.get(0).asInt();
            int y = pair.get(1).asInt();
            tiles.get(i).setPosition(x, y);
        }
        return toGrid(tiles, width, height);
    }

    // Fill the Tile[][] using the list<Tile>
    private static Tile[][] toGrid(List<Tile> tiles, int width, int height) {
        Tile[][] grid = new Tile[width][height];

        for (Tile tile : tiles) {
            int x = tile.getX();
            int y = tile.getY();
            if (x >= 0 && x < width && y >= 0 && y < height) {
                grid[x][y] = tile;
            } else {
                System.err.println("Tile " + tile + " has out-of-bounds position (" + x + ", " + y + ")");
            }
        }

        return grid;
    }
}
