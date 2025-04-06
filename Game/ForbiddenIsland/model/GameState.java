package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.Players.Player;

import java.util.List;

public class GameState {
    private List<Player> players;
    private List<Tile> board;
    private int waterLevel;
    public void waterRise(){
        waterLevel++;

    }
}
