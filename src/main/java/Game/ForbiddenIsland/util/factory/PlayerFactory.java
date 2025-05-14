package Game.ForbiddenIsland.util.factory;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerImp;
import Game.ForbiddenIsland.model.Players.PlayerType;

import java.awt.Color;

public class PlayerFactory {
    public static Player createPlayer(PlayerType type) {
        return new PlayerImp(type);
    }

    public static Player createPlayer(PlayerType type, Color color, Tile startingTile) {
        Player player = new PlayerImp(type);
        player.setColor(color);
        player.setPosition(startingTile);
        return player;
    }
}
