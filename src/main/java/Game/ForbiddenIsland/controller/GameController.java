package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.Board.Deck;
import Game.ForbiddenIsland.model.Board.DeckImp;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Board.Tiles.TileImp;
import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Cards.cardCategory.TreasureCard;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerType;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.model.view.GameStateView;
import Game.ForbiddenIsland.util.ActionContext;
import Game.ForbiddenIsland.util.GameStateMapper;
import Game.ForbiddenIsland.util.JsonUtil;
import Game.ForbiddenIsland.util.factory.CardFactory;
import Game.ForbiddenIsland.util.factory.MapFactory;
import Game.ForbiddenIsland.util.factory.PlayerFactory;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

/**
 * GameController is the core controller class for the Forbidden Island game.
 * It manages the game flow, rules, and state.
 */
public class GameController {
    // 1. Basic Properties and Constructor
    private GameState gameState = new GameState();
    private int actionsRemaining = 3;
    private boolean gameOver = false;
    private String gameResult = "";
    private int playerCount;
    private int difficultyLevel;
    private boolean initialized = false; // Lazy loading flag

    /**
     * Constructor for GameController
     * @param playerCount Number of players in the game
     * @param difficultyLevel Game difficulty level
     */
    public GameController(int playerCount, int difficultyLevel) {
        this.playerCount = playerCount;
        this.difficultyLevel = difficultyLevel;
    }

    // 2. Game Initialization and Setup Methods
    /**
     * Initializes the game if it hasn't been initialized yet
     */
    public void initializeIfNeeded() {
        if (!initialized) {
            initializeBoard();
            initializePlayers(playerCount);
            initializeWaterLevel(difficultyLevel);
            initializeDecks();
            dealInitialTreasureCards();
            initialFloodDraw();
            initialized = true;
            startTurn();
        }
    }

    /**
     * Initializes players with their types and colors
     * @param playerCount Number of players to initialize
     */
    private void initializePlayers(int playerCount) {
        List<Player> players = new ArrayList<>();
        PlayerType[] availableTypes = PlayerType.values();
        Color[] colors = {Color.RED, Color.BLUE, Color.GREEN, Color.YELLOW, Color.ORANGE, Color.MAGENTA};
        Tile startingTile = getFoolsLanding();
        
        for (int i = 0; i < playerCount; i++) {
            PlayerType type = availableTypes[i % availableTypes.length];
            Player player = PlayerFactory.createPlayer(type, colors[i], startingTile);
            players.add(player);
        }
        gameState.setPlayers(players);
    }

    /**
     * Initializes the game board using MapFactory
     */
    private void initializeBoard() {
        try {
            gameState.setMap(MapFactory.loadMaps());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load map", e);
        }
    }

    /**
     * Sets the initial water level based on difficulty
     * @param difficultyLevel Game difficulty level
     */
    private void initializeWaterLevel(int difficultyLevel) {
        gameState.setWaterLevel(difficultyLevel);
    }

    /**
     * Initializes both treasure and flood decks
     */
    private void initializeDecks() {
        // Initialize treasure deck
        try {
            List<Card> cards = CardFactory.loadTreasureCard();
            Deck<Card> deck = new DeckImp<>();
            deck.initialize(cards);
            gameState.setTreasureDeck(deck);
            gameState.setAllCards(cards);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Initialize flood deck
        gameState.setFloodDeck(CardFactory.loadFloodCard(gameState.getMap().getAllTiles()));
        if (gameState.getTreasureDeck() instanceof DeckImp<?>) {
            gameState.setTreasureDeckRemaining(((DeckImp<?>) gameState.getTreasureDeck()).getDrawPileSize());
        }
        if (gameState.getFloodDeck() instanceof DeckImp<?>) {
            gameState.setFloodDeckRemaining(((DeckImp<?>) gameState.getFloodDeck()).getDrawPileSize());
        }
    }

    /**
     * Deals initial treasure cards to all players
     */
    private void dealInitialTreasureCards() {
        for (Player player : gameState.getPlayers()) {
            for (int i = 0; i < 2; i++) {
                drawAndProcessTreasureCard(player);
            }
        }
    }

    /**
     * Draws and processes a treasure card for a player
     * @param player Player to receive the card
     */
    private void drawAndProcessTreasureCard(Player player) {
        Card drawnCard = gameState.drawTreasureCard();
        if (drawnCard == null) return;
        if (drawnCard instanceof ActionCard &&
                ((ActionCard) drawnCard).getCardName() == CardName.WATERRISE) {
            // Discard water rise card and draw again
            gameState.discardTreasure(drawnCard);
            drawAndProcessTreasureCard(player);
        } else {
            player.addCard(drawnCard);
        }
    }

    /**
     * Performs initial flood card draws
     */
    private void initialFloodDraw() {
        for (int i = 0; i < 6; i++) {
            gameState.drawFloodCard();  // drawFloodCard() automatically floods and discards
        }
    }

    // 3. Turn Management Methods
    /**
     * Starts a new turn for the current player
     */
    public void startTurn() {
        actionsRemaining = 3;
        checkGameState();
    }

    /**
     * Ends the current turn and starts the next player's turn
     */
    public void endTurn() {
        drawTreasureCards();
        drawFloodCards();
        checkGameState();
        gameState.nextPlayer();
        actionsRemaining = 3;
    }

    /**
     * Draws treasure cards for the current player
     */
    private void drawTreasureCards() {
        Player currentPlayer = gameState.getCurrentPlayer();

        // Draw 2 treasure cards
        for (int i = 0; i < 2; i++) {
            Card drawnCard = gameState.drawTreasureCard();
            if (drawnCard == null) {
                gameOver = true;
                gameResult = "No more cards!";
                return;
            }

            // Only treat "Water Rise Card" as an action card that takes effect immediately
            if (drawnCard instanceof ActionCard
                    && ((ActionCard) drawnCard).getCardName() == CardName.WATERRISE) {

                // Construct an empty ActionContext (Water Rise does not require a target)
                ActionCard actionCard = (ActionCard) drawnCard;
                ActionContext context = new ActionContext.Builder().build();
                actionCard.use(gameState, context);
                gameState.discardTreasure(drawnCard);

            } else {
                // In other cases: either it's a regular treasure card or an "action card that can be held" (helicopter, sandbags, etc.)
                currentPlayer.addCard( drawnCard);
            }
        }
    }



    /**
     * Draws flood cards based on current water level
     */
    private void drawFloodCards() {
        int cardsToDraw = gameState.getWaterLevel();
        
        for (int i = 0; i < cardsToDraw; i++) {
            Card drawnCard = gameState.drawFloodCard();
            if (drawnCard == null) {
                gameState.reshuffleFloodDeck();
            }
        }
    }

    // 4. Player Action Methods
    /**
     * Moves a player to a target tile
     * @param player Player to move
     * @param targetTile Target tile to move to
     * @return true if move was successful
     */
    public boolean movePlayer(Player player, Tile targetTile) {
        if (actionsRemaining <= 0) return false;
        
        if (isValidMove(player, targetTile)) {
            player.setPosition(targetTile);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    /**
     * Shores up a target tile
     * @param target Tile to shore up
     * @return true if action was successful
     */
    public boolean shoreUp(Tile target){
        if (actionsRemaining <= 0) return false;
        target.drain();
        return true;
    }

    /**
     * Collects a treasure from the current tile
     * @param player Player collecting the treasure
     * @param treasureType Type of treasure to collect
     * @return true if collection was successful
     */
    public boolean collectTreasure(Player player, TreasureType treasureType) {
        if (actionsRemaining <= 0) return false;
        
        if (canCollectTreasure(player, treasureType)) {
            gameState.setTreasureCollected(treasureType, true);
            int i = 0;
            List<Card> cards = getCurrentPlayer().getHands();
            while (i < 4){
                if (cards.contains(treasureType)){
                    cards.remove(treasureType);
                    i++;
                }
            }
            getCurrentPlayer().setHands(cards);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    /**
     * Gives a card from one player to another
     * @param giver Player giving the card
     * @param receiver Player receiving the card
     * @param card Card to give
     * @return true if action was successful
     */
    public boolean giveCard(Player giver, Player receiver, Card card) {
        if (actionsRemaining <= 0) return false;
        
        if (canGiveCard(giver, receiver, card)) {
            giver.removeCard(card);
            receiver.addCard(card);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    /**
     * Uses a player's special ability
     * @param player Player using the ability
     * @param params Parameters for the ability
     * @return true if ability was used successfully
     */
    public boolean useSpecialAbility(Player player, Object... params) {
        if (actionsRemaining <= 0) return false;
        switch (player.getType()) {
            case PILOT:
                return usePilotAbility(player, (Tile) params[0]);
            case ENGINEER:
                return useEngineerAbility(player, (List<Tile>) params[0]);
            case NAVIGATOR:
                return useNavigatorAbility(player, (Player) params[0], (Tile) params[1]);
            case EXPLORER:
                return useExplorerAbility(player, (Tile) params[0]);
            case DIVER:
                return useDiverAbility(player, (Tile) params[0]);
            case MESSENGER:
                return useMessengerAbility(player, (Player) params[0], (Card) params[1]);
            default:
                return false;
        }
    }

    /**
     * Uses an action card
     * @param card Card to use
     * @param actionContext Context for the action
     */
    public void useCards(ActionCard card, ActionContext actionContext) {
        card.use(gameState, actionContext);
        gameState.discardTreasure(card);
        actionContext.getTargetPlayers().get(0).removeCard(card);
    }

    // 5. Special Ability Methods
    /**
     * Uses the Pilot's special ability to fly anywhere
     */
    private boolean usePilotAbility(Player player, Tile targetTile) {
        player.setPosition(targetTile);
        return true;
    }

    /**
     * Uses the Engineer's special ability to shore up two tiles
     */
    private boolean useEngineerAbility(Player player, List<Tile> tiles) {
        if (tiles.size() > 2) return false;
        for (Tile tile : tiles) {
            tile.drain();
        }
        return true;
    }

    /**
     * Uses the Navigator's special ability to move another player
     */
    private boolean useNavigatorAbility(Player navigator, Player targetPlayer, Tile targetTile) {
        if (isValidNormalMove(targetPlayer.getPosition(), targetTile)) {
            targetPlayer.setPosition(targetTile);
            return true;
        }
        return false;
    }

    /**
     * Uses the Explorer's special ability to move diagonally
     */
    private boolean useExplorerAbility(Player explorer, Tile targetTile) {
        if (isValidExplorerMove(explorer.getPosition(), targetTile)) {
            explorer.setPosition(targetTile);
            return true;
        }
        return false;
    }

    /**
     * Uses the Diver's special ability to move through sunk tiles
     */
    private boolean useDiverAbility(Player diver, Tile targetTile) {
        if (isValidDiverMove(diver.getPosition(), targetTile)) {
            diver.setPosition(targetTile);
            return true;
        }
        return false;
    }

    /**
     * Uses the Messenger's special ability to give cards from anywhere
     */
    private boolean useMessengerAbility(Player messenger, Player targetPlayer, Card card) {
        messenger.removeCard(card);
        targetPlayer.addCard(card);
        return true;
    }

    // 6. Movement Validation Methods
    /**
     * Validates if a move is legal for a player
     */
    private boolean isValidMove(Player player, Tile targetTile) {
        switch (player.getType()) {
            case EXPLORER:
                return isValidExplorerMove(player.getPosition(), targetTile);
            case PILOT:
                return true; // Pilot can fly anywhere
            default:
                return isValidNormalMove(player.getPosition(), targetTile);
        }
    }

    /**
     * Validates a normal move (orthogonal only)
     */
    private boolean isValidNormalMove(Tile current, Tile target) {
        if (target == null || target.isSink()) {
            return false;
        }
        
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
    }

    /**
     * Validates an Explorer's move (including diagonal)
     */
    private boolean isValidExplorerMove(Tile current, Tile target) {
        if (target == null || target.isSink()) {
            return false;
        }
        
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        return (dx <= 1 && dy <= 1) && !(dx == 0 && dy == 0);
    }

    /**
     * Validates a Diver's move (through sunk tiles)
     */
    private boolean isValidDiverMove(Tile current, Tile target) {
        if (target == null) {
            return false;
        }
        
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
    }

    // 7. Game State Check Methods
    /**
     * Checks the current game state for win/loss conditions
     */
    private void checkGameState() {
        if (gameState.isGameWon()) {
            gameOver = true;
            gameResult = "Victory!";
            return;
        }

        if (gameState.isGameLost()) {
            gameOver = true;
            gameResult = "Defeat!";
        }
    }

    /**
     * Checks if a player is trapped
     */
    private boolean isPlayerTrapped(Player player) {
        Tile currentTile = player.getPosition();
        
        if (currentTile.isSink()) {
            return true;
        }
        
        List<Tile> adjacentTiles = gameState.getMap().getAdjacentTiles(currentTile);
        
        for (Tile adjacentTile : adjacentTiles) {
            if (adjacentTile != null && !adjacentTile.isSink()) {
                if (player.getType() == PlayerType.DIVER) {
                    return false;
                }
                if (adjacentTile.isSafe()) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Checks if a player has the required cards for a treasure
     */
    private boolean hasRequiredCards(Player player, TreasureType type) {
        int count = 0;
        for (Card card : player.getHands()) {
            if (card instanceof TreasureCard && 
                ((TreasureCard) card).getTreasureType() == type) {
                count++;
            }
        }
        return count >= 4;
    }

    /**
     * Checks if a player can collect a treasure
     */
    private boolean canCollectTreasure(Player player, TreasureType treasureType) {
        return player.getPosition().getTreasureType() == treasureType &&
               hasRequiredCards(player, treasureType);
    }

    /**
     * Checks if a player can give a card to another player
     */
    private boolean canGiveCard(Player giver, Player receiver, Card card) {
        if (giver.getType() == PlayerType.MESSENGER) {
            return true; // Messenger can give cards from anywhere
        }
        return giver.getPosition() == receiver.getPosition();
    }

    // 8. Utility Methods
    /**
     * Creates a new tile
     */
    private Tile createTile(int x, int y, TreasureType treasureType, boolean isFoolsLanding) {
        Tile tile = new TileImp();
        tile.setPosition(x, y);
        tile.setTreasureType(treasureType);
        tile.setFoolsLanding(isFoolsLanding);
        tile.setName(getTileName(x, y, treasureType, isFoolsLanding));
        return tile;
    }

    /**
     * Gets the name for a tile
     */
    private String getTileName(int x, int y, TreasureType treasureType, boolean isFoolsLanding) {
        if (isFoolsLanding) return "Fools' Landing";
        if (treasureType != null) {
            return treasureType.name() + " Island";
        }
        return "Normal Island " + x + "," + y;
    }

    /**
     * Gets the Fools' Landing tile
     */
    private Tile getFoolsLanding() {
        for (Tile tile : gameState.getMap().getAllTiles()) {
            if (tile.isFoolsLanding()) {
                return tile;
            }
        }
        return null;
    }

    // 9. Getter Methods
    /**
     * Gets the current player
     */
    public Player getCurrentPlayer() {
        return gameState.getCurrentPlayer();
    }

    /**
     * Gets the number of actions remaining
     */
    public int getActionsRemaining() {
        return actionsRemaining;
    }

    /**
     * Checks if the game is over
     */
    public boolean isGameOver() {
        return gameOver;
    }

    /**
     * Gets the game result
     */
    public String getGameResult() {
        return gameResult;
    }

    /**
     * Gets the current game state
     */
    public GameState getGameState() {
        return gameState;
    }

    /**
     * Gets the game state as JSON
     */
    public String getGameStateJson() {
        GameStateView view = GameStateMapper.fromGameState(this.gameState);
        return JsonUtil.toJson(view);
    }
}
