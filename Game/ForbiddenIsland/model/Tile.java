package Game.ForbiddenIsland.model;

public interface Tile {
    TileState getState();
    void setState(TileState state);
}
