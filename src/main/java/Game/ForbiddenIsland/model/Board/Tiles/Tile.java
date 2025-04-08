package Game.ForbiddenIsland.model.Board.Tiles;

import Game.ForbiddenIsland.model.TreasureType;

public interface Tile {
    String getName();
    void setName(String name);

    TreasureType getTreasureType();
    void setTreasureType(TreasureType treasureType);

    boolean isFoolsLanding();
    void setFoolsLanding(boolean foolsLanding);

    TileState getState();
    void flood();
    void drain();

    boolean isSafe();
    boolean isFlooded();
    boolean isSink();
}
