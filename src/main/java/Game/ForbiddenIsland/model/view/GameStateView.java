package Game.ForbiddenIsland.model.view;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Cards.cardCategory.FloodCard;
import Game.ForbiddenIsland.model.TreasureType;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GameStateView {
    private int waterLevel;
    private int currentPlayerIndex;
    private List<PlayerView> players;
    private Tile[][] board;
    private Map<TreasureType, Boolean> collectedTreasures;
    private List<Card> treasureDiscardPile;
    private List<FloodCard> floodDiscardPile;

    // Getters and setters omitted for brevity — you can generate with IDE or Lombok
}
