package Game.ForbiddenIsland.util.factory;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerImp;
import Game.ForbiddenIsland.model.Players.PlayerType;

public class PlayerFactory {
    public static Player createPlayer(PlayerType type) {
        return new PlayerImp(type);
    }
}
