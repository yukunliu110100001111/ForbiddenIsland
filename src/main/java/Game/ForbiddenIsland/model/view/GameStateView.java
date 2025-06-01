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
    private TileView[][] board;
    private Map<TreasureType, Boolean> collectedTreasures;
    private List<Card> treasureDiscardPile;
    private List<FloodCard> floodDiscardPile;

    private int actionsLeft;                    // actions remain
    private boolean gameWon;
    private boolean gameLost;
    private List<Card> recentTreasureDraws;     // recent treasure draws
    private List<FloodCard> recentFloodDraws;   // recent flood draws

    private int treasureDeckRemaining;          // Treasure card remaining
    private int floodDeckRemaining;             // Flood card remaining

}

