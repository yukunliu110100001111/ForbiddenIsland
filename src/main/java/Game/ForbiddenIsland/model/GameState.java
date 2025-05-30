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

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

//GameState 里有所有游戏状态，也就是玩家、地图、两个牌堆、水level
public class GameState {
    @Setter @Getter
    private List<Player> players;
    @Getter @Setter
    private int actionsRemaining = 3; // 每回合剩余行动数，默认3
    @Setter @Getter
    private GameMap map;
    @Setter @Getter
    private Deck<Card> treasureDeck;
    @Getter @Setter
    private Deck<FloodCard> floodDeck;
    @Setter @Getter
    private List<Card> allCards;
    private int currentPlayerIndex;
    @Setter @Getter
    private int waterLevel;
    @Getter
    private final Map<TreasureType, Boolean> collectedTreasures =
            new EnumMap<>(Map.of(
                    TreasureType.EARTH, false,
                    TreasureType.WIND, false,
                    TreasureType.FIRE, false,
                    TreasureType.WATER, false
            ));

    // ==== 新增字段 ====
    private int actionsLeft = 3; // 每回合剩余行动数，默认3
    private List<Card> recentTreasureDraws = new ArrayList<>();
    private List<FloodCard> recentFloodDraws = new ArrayList<>();
    private List<GameLogEntry> history = new ArrayList<>();
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

    public List<GameLogEntry> getHistory() {
        return history;
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
        return card;
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
    public int getCurrentPlayerIndex() {
        return currentPlayerIndex;
    }

    // ==== 新增 getter/setter ====
    public int getActionsLeft() { return actionsLeft; }
    public void setActionsLeft(int actionsLeft) { this.actionsLeft = actionsLeft; }

    public List<Card> getRecentTreasureDraws() { return recentTreasureDraws; }
    public void setRecentTreasureDraws(List<Card> draws) {
        this.recentTreasureDraws = (draws == null) ? new ArrayList<>() : draws;
    }

    public List<FloodCard> getRecentFloodDraws() { return recentFloodDraws; }
    public void setRecentFloodDraws(List<FloodCard> draws) {
        this.recentFloodDraws = (draws == null) ? new ArrayList<>() : draws;
    }
    // ===========================

}
