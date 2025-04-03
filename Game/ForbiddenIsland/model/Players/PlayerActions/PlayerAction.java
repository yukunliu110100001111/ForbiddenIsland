package Game.ForbiddenIsland.model.Players.PlayerActions;

import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Tile;

import java.util.List;

public interface PlayerAction {

    /**
     * get the available move tiles
     */
    List<Tile> getAvailableMoveTiles(Player player, GameState state);

    /**
     * get the available drain tiles
     */
    List<Tile> getAvailableDrainTiles(Player player, GameState state);

    /**
     * turn start ( refresh the player's state)
     */
    void onTurnStart(Player player, GameState state);

    /**
     * end turn
     */
    default void onTurnEnd(Player player, GameState state) {}
}