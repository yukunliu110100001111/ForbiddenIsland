package Game.ForbiddenIsland.model.Board;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.TreasureType;

import java.util.ArrayList;
import java.util.List;

public class GameMap {
    private Tile[][] board;

    public GameMap(Tile[][] board) {
        this.board = board;
    }

    public Tile getTileAt(int x, int y) {
        if (x < 0 || y < 0 || x >= 6 || y >= 6) return null;
        return board[y][x];
    }

    public List<Tile> getAdjacentTiles(Tile tile) {
        List<Tile> adjacent = new ArrayList<>();
        int x = tile.getX();
        int y = tile.getY();

        int[][] dirs = {{0,1},{1,0},{0,-1},{-1,0}};
        for (int[] d : dirs) {
            Tile t = getTileAt(x + d[0], y + d[1]);
            if (t != null && !t.isSink()) {
                adjacent.add(t);
            }
        }
        return adjacent;
    }

    public List<Tile> getAllTiles() {
        List<Tile> tiles = new ArrayList<>();
        for (int y = 0; y < 6; y++) {
            for (int x = 0; x < 6; x++) {
                Tile tile = board[y][x];
                if (tile != null) {
                    tiles.add(tile);
                }
            }
        }
        return tiles;
    }

    public List<Tile> getAllTreasureTiles(TreasureType type) {
        List<Tile> result = new ArrayList<>();
        for (Tile t : getAllTiles()) {
            if (t.getTreasureType() == type) {
                result.add(t);
            }
        }
        return result;
    }

    public boolean isTreasureInaccessible(TreasureType type) {
        List<Tile> treasures = getAllTreasureTiles(type);
        return treasures.stream().allMatch(Tile::isSink);
    }

    public boolean isFoolsLandingSunk() {
        for (Tile t : getAllTiles()) {
            if (t.isFoolsLanding()) {
                return t.isSink();
            }
        }
        return false;
    }

    public Tile[][] getBoard() {
        return board;
    }
}

