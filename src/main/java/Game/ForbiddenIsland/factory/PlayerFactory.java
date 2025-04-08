package Game.ForbiddenIsland.factory;

import Game.ForbiddenIsland.model.*;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerType;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class PlayerFactory {
    public static Player createPlayer(PlayerType type, Color color, Tile startTile) {
        List<Card> hands = new ArrayList<>();
        return new Player(type, hands, color, startTile);
    }
}
