package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.Board.Deck;
import Game.ForbiddenIsland.model.Board.DeckImp;
import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Cards.cardCategory.FloodCard;
import Game.ForbiddenIsland.model.Players.Player;
import lombok.Getter;
import lombok.Setter;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

//GameState 里有所有游戏状态，也就是玩家、地图、两个牌堆、水level
public class GameState {
    @Setter
    @Getter
    private List<Player> players;
    @Setter
    @Getter
    private GameMap map;
    @Setter
    @Getter
    private Deck<Card> treasureDeck;
    @Getter
    @Setter
    private Deck<FloodCard> floodDeck;
    @Setter
    @Getter
    private List<Card> allCards;
    private int currentPlayerIndex;
    @Setter
    @Getter
    private int waterLevel;
    @Getter
    private final Map<TreasureType, Boolean> collectedTreasures =
            new EnumMap<>(Map.of(
                    TreasureType.EARTH, false,
                    TreasureType.WIND, false,
                    TreasureType.FIRE, false,
                    TreasureType.WATER, false
            ));

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

    public void waterRise(){
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

    public Player getCurrentPlayer() {
        return players.get(currentPlayerIndex);
    }

    public void nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
    }

    public Tile getTileAt(int x, int y) {
        return map.getTileAt(x, y);
    }
    public Card drawTreasureCard() {
        return treasureDeck.drawCard();
    }

    public void discardTreasure(Card card) {
        treasureDeck.discard(card);
    }

    public Card drawFloodCard() {
        FloodCard card = (FloodCard) floodDeck.drawCard();
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
    public List<Card> getPlayerHand(int playerIndex){
        return players.get(playerIndex).getHands();
    }
    public int getCurrentPlayerIndex() {
        return currentPlayerIndex;
    }


}
