package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Players.Player;

import java.util.*;

public class GameState {
    private List<Player> players;
    private GameMap map;

    private final Map<TreasureType, Boolean> collectedTreasures =
            new EnumMap<>(Map.of(
                    TreasureType.EARTH, false,
                    TreasureType.WIND, false,
                    TreasureType.FIRE, false,
                    TreasureType.WATER, false
            ));

    private int waterLevel;
    public void waterRise(){
        waterLevel++;
    }

    public int getWaterLevel() {
        return waterLevel;
    }

    public GameMap getMap() {
        return map;
    }

    public boolean isTreasureCollected(TreasureType type) {
        return collectedTreasures.getOrDefault(type, false);
    }

    public void setTreasureCollected(TreasureType type, boolean value) {
        collectedTreasures.replace(type, value);
    }

}
