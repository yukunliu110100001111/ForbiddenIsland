package Game.ForbiddenIsland.util.factory;

import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Board.Tiles.TileImp;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;

import java.io.File;
import java.util.Collections;
import java.util.List;

public class MapFactory {
    public static GameMap loadMaps(String mapPath) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addAbstractTypeMapping(Tile.class, TileImp.class);
        mapper.registerModule(module);
        List<Tile> tiles = mapper.readValue(new File("src/main/resources/model/tiles.json"), new TypeReference<>() {});
        Collections.shuffle(tiles);
        return new GameMap(assignPositions(tiles,mapPath));
    }

    //load a map file to initialize a list to an two-dimensional array
    private static Tile[][] assignPositions(List<Tile> tiles, String jsonPath) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(new File(jsonPath));
        JsonNode positions = root.get("validPositions");
        int width = root.get("width").asInt();
        int height = root.get("height").asInt();

        if (positions == null || !positions.isArray()) {
            throw new IllegalArgumentException("JSON format error：validPositions should be array");
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
        return toGrid(tiles,width,height);
    }

    //Fill the Tile[][] use the list<Tile>
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
