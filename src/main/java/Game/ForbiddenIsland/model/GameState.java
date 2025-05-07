package Game.ForbiddenIsland.model;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Players.Player;

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

    public void setWaterLevel(int difficultyLevel) {
        this.waterLevel = difficultyLevel;
    }

    public void setBoard(List<Tile> board) {
        // TODO: 实现设置地图的逻辑
    }

    public void setPlayers(List<Player> players) {
        this.players = players;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public void setMap(GameMap map) {
        this.map = map;
    }
}
