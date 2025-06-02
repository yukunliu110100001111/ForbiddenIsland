package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.Board.Deck;
import Game.ForbiddenIsland.model.Board.DeckImp;
import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Cards.cardCategory.FloodCard;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.log.GameLogEntry;
import lombok.Getter;
import lombok.Setter;

import javax.swing.text.Position;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

//GameState all state in game, map, card deck, player list, water level
@Getter
public class GameState {
    @Setter
    private List<Player> players;
    @Setter
    private int actionsRemaining = 3; // each turn remains3
    @Setter
    private GameMap map;
    @Setter
    private Deck<Card> treasureDeck;
    @Setter
    private Deck<FloodCard> floodDeck;
    @Setter
    private List<Card> allCards;
    private int currentPlayerIndex;
    @Setter
    private int waterLevel;
    private final Map<TreasureType, Boolean> collectedTreasures =
            new EnumMap<>(Map.of(
                    TreasureType.EARTH, false,
                    TreasureType.WIND, false,
                    TreasureType.FIRE, false,
                    TreasureType.WATER, false
            ));
    private int actionsLeft = 3; // each turn remains 3
    @Setter
    private List<Card> recentTreasureDraws = new ArrayList<>();
    @Setter
    private List<FloodCard> recentFloodDraws = new ArrayList<>();
    private List<GameLogEntry> history = new ArrayList<>();
    /** remaining decks */
    @Setter
    private int treasureDeckRemaining;
    @Setter
    private int floodDeckRemaining;
    /** legal movements, use for view */
    @Setter
    private List<Position> legalMoves = new ArrayList<>();
    @Setter
    private List<Position> legalShores = new ArrayList<>();
    @Setter
    private List<Position> legalCaptures = new ArrayList<>();
    // ==================

    public GameState() {
        this.treasureDeck = new DeckImp<>();
        this.floodDeck = new DeckImp<>();
        this.waterLevel = 0;
        this.currentPlayerIndex = 0;
    }

    public GameState(List<Player> players, GameMap map,
                     Deck<Card> treasureDeck, Deck<FloodCard> floodDeck) {
        this.players = players;
        this.map = map;
        this.treasureDeck = treasureDeck;
        this.floodDeck = floodDeck;
        this.waterLevel = 0;
        this.currentPlayerIndex = 0;
        this.treasureDeckRemaining = ((DeckImp<?>) treasureDeck).getDrawPileSize();
        this.floodDeckRemaining = ((DeckImp<?>) floodDeck).getDrawPileSize();

    }

    public void waterRise() {
        waterLevel++;
    }

    public boolean isTreasureCollected(TreasureType type) {
        return collectedTreasures.getOrDefault(type, false);
    }

    public void setTreasureCollected(TreasureType type, boolean value) {
        collectedTreasures.replace(type, value);
    }

    public boolean allTreasuresCollected() {
        return collectedTreasures.values().stream().allMatch(Boolean::booleanValue);
    }

    public void addHistory(GameLogEntry entry) {
        history.add(entry);
    }


    public Player getCurrentPlayer() {
        return players.get(currentPlayerIndex);
    }

    public void nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
        // 新回合时行动数重置为3，抽牌记录清空
        actionsLeft = 3;
        recentTreasureDraws.clear();
        recentFloodDraws.clear();
    }

    public Tile getTileAt(int x, int y) {
        return map.getTileAt(x, y);
    }

    public Card drawTreasureCard() {
        Card card = treasureDeck.drawCard();
        if (card != null) {
            recentTreasureDraws.add(card);
        }
        treasureDeckRemaining = ((DeckImp<?>) treasureDeck).getDrawPileSize();
        return card;
    }

    /**
     * Find a player by their index
     * @param index Player index to find
     * @return Player object or null if index is out of bounds
     */
    public Player findPlayerByIndex(int index) {
        if (index >= 0 && index < players.size()) {
            return players.get(index);
        }
        return null;
    }

    public void discardTreasure(Card card) {
        treasureDeck.discard(card);
    }

    public FloodCard drawFloodCard() {
        FloodCard card = (FloodCard) floodDeck.drawCard();
        if (card == null) {
            floodDeck.reshuffleDiscardsIntoDrawPile();
            card = (FloodCard) floodDeck.drawCard();
        }
        if (card != null) {
            card.flood();
            floodDeck.discard(card);
        }
        floodDeckRemaining = ((DeckImp<?>) floodDeck).getDrawPileSize();
        return card;
    }

    public void reshuffleFloodDeck() {
        floodDeck.reshuffleDiscardsIntoDrawPile();
    }

    public boolean isGameWon() {
        return allTreasuresCollected()
                && players.stream().allMatch(p -> p.getPosition().isFoolsLanding());
    }

    public boolean isGameLost() {
        return map.isFoolsLandingSunk()
                || collectedTreasures.entrySet().stream().anyMatch(e ->
                !e.getValue() && map.isTreasureInaccessible(e.getKey())
        );
    }

    public Card getCardById(int targetCard) {
        return allCards.get(targetCard);
    }
    public Player findPlayerByName(int name) {
        return this.players.get(name);
    }

    //getter for frontier
    public List<Card> getPlayerHand(int playerIndex) {
        return players.get(playerIndex).getHands();
    }

    public void setActionsLeft(int actionsLeft) { this.actionsLeft = actionsLeft; }

    public void setRecentTreasureDraws(List<Card> draws) {
        this.recentTreasureDraws = (draws == null) ? new ArrayList<>() : draws;
    }

    public void setRecentFloodDraws(List<FloodCard> draws) {
        this.recentFloodDraws = (draws == null) ? new ArrayList<>() : draws;
    }
    // ===========================

    // GameState.java
    public void syncDeckRemaining() {
        if (treasureDeck instanceof DeckImp<?> d) {
            this.treasureDeckRemaining = d.getDrawPileSize();
        }
        if (floodDeck instanceof DeckImp<?> d) {
            this.floodDeckRemaining = d.getDrawPileSize();
        }
    }

}
