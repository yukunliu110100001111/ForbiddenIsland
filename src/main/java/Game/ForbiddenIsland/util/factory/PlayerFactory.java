package Game.ForbiddenIsland.util.factory;

import java.awt.Color;
import java.util.ArrayList;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerImp;
import Game.ForbiddenIsland.model.Players.PlayerType;

public class PlayerFactory {
    public static Player createPlayer(PlayerType type, Color color, Tile startingTile) {
        return new PlayerImp(type, startingTile, new ArrayList<>());
    }
}
