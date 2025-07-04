package Game.ForbiddenIsland.model.view;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Players.PlayerType;

import lombok.Data;

import java.util.List;

@Data
public class PlayerView {
    private int playerIndex;
    private PlayerType type;
    private Tile currentTile;
    private List<Card> hand;
    private int x;
    private int y;
}
