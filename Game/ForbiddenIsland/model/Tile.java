package Game.ForbiddenIsland.model;

public interface Tile {
    TileState getState();
    void flood();
    void sink();
    void drain();
}
