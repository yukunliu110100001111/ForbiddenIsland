package Game.ForbiddenIsland.factory;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Board.Tiles.TileImp;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class TileFactory {
    public static List<Tile> loadAndShuffleTiles(String jsonPath, Random rng) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addAbstractTypeMapping(Tile.class, TileImp.class);
        mapper.registerModule(module);
        List<Tile> tiles = mapper.readValue(new File(jsonPath), new TypeReference<>() {});
        return tiles;
    }
}
