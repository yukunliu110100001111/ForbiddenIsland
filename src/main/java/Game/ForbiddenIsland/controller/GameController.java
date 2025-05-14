package Game.ForbiddenIsland.controller;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;
import Game.ForbiddenIsland.model.Board.GameMap;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Board.Tiles.TileImp;
import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Cards.cardCategory.TreasureCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.FloodCard;
import Game.ForbiddenIsland.model.Cards.CardActions.CardAction;
import Game.ForbiddenIsland.model.Cards.CardActions.Helicopter;
import Game.ForbiddenIsland.model.Cards.CardActions.SandBag;
import Game.ForbiddenIsland.model.Cards.CardActions.WaterRise;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerType;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.util.factory.CardFactory;
import Game.ForbiddenIsland.util.factory.MapFactory;
import Game.ForbiddenIsland.util.factory.PlayerFactory;
import Game.ForbiddenIsland.util.ActionContext;


// 11111

//11
public class GameController {
    private GameState gameState;
    private int actionsRemaining = 3;
    private boolean gameOver = false;
    private String gameResult = "";

    public GameController(int playerCount, int difficultyLevel) {
        this.gameState = new GameState();
        initializePlayers(playerCount);
        initializeBoard();
        initializeWaterLevel(difficultyLevel);
        initializeDecks();
    }

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
    } //playerfacotry和gamemap

    private void initializeBoard() {
        try {
            gameState.setMap(MapFactory.loadMaps());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }//这个用gamemap

    private Tile createTile(int x, int y, TreasureType treasureType, boolean isFoolsLanding) {
        Tile tile = new TileImp();
        tile.setPosition(x, y);
        tile.setTreasureType(treasureType);
        tile.setFoolsLanding(isFoolsLanding);
        tile.setName(getTileName(x, y, treasureType, isFoolsLanding));
        return tile;
    } //这个用map

    private String getTileName(int x, int y, TreasureType treasureType, boolean isFoolsLanding) {
        if (isFoolsLanding) return "Fools' Landing";
        if (treasureType != null) {
            return treasureType.name() + " Island";
        }
        return "Normal Island " + x + "," + y;
    }

    private void initializeWaterLevel(int difficultyLevel) {
        gameState.setWaterLevel(difficultyLevel);
    }

    private void initializeDecks() {
        // 初始化宝藏牌堆
        try {
            gameState.setTreasureDeck(CardFactory.loadTreasureCard());
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 初始化沉没牌堆
        gameState.setFloodDeck(CardFactory.loadFloodCard(gameState.getMap().getAllTiles()));
    }//这个用deck和cardFactory初始化

    public void startTurn() {
        actionsRemaining = 3;
        checkGameState();
    }

    public void endTurn() {
        drawTreasureCards();
        drawFloodCards();
        checkGameState();
        gameState.nextPlayer();
    }

    private void drawTreasureCards() {
        Player currentPlayer = gameState.getCurrentPlayer();
        
        // 抽2张卡
        for (int i = 0; i < 2; i++) {
            Card drawnCard = gameState.drawTreasureCard();
            if (drawnCard == null) {
                gameOver = true;
                gameResult = "No more cards!";
                return;
            }
            
            // 检查是否是水位上升卡
            if (drawnCard instanceof ActionCard && drawnCard.getCardType() == CardType.ACTION) {
                ActionCard actionCard = (ActionCard) drawnCard;
                ActionContext context = new ActionContext.Builder().build();
                actionCard.use(gameState, context);
                gameState.discardTreasure(drawnCard);
            } else {
                // 检查手牌上限
                if (currentPlayer.getHands().size() >= currentPlayer.getHandsSize()) {
                    // 手牌已满，必须弃牌
                    gameState.discardTreasure(drawnCard);
                } else {
                    currentPlayer.addCard(drawnCard);
                }
            }
        }
    }

    private void drawFloodCards() {
        int cardsToDraw = gameState.getWaterLevel();
        
        for (int i = 0; i < cardsToDraw; i++) {
            Card drawnCard = gameState.drawFloodCard();
            if (drawnCard == null) {
                gameState.reshuffleFloodDeck();
            }
        }
    } //逻辑问题，抽完洪水卡洗回去

    public boolean movePlayer(Player player, Tile targetTile) {
        if (actionsRemaining <= 0) return false;
        
        if (isValidMove(player, targetTile)) {
            player.setPosition(targetTile);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    public boolean shoreUp(Tile target){
        if (actionsRemaining <= 0) return false;
        target.drain();
        return true;
    }
    public boolean collectTreasure(Player player, TreasureType treasureType) {
        if (actionsRemaining <= 0) return false;
        
        if (canCollectTreasure(player, treasureType)) {
            gameState.setTreasureCollected(treasureType, true);
            int i = 0;
            while (i < 4){
                List<Card> cards = getCurrentPlayer().getHands();
                if (cards.contains(treasureType)){
                    cards.remove(treasureType);
                    i++;
                }
            }
            actionsRemaining--;
            return true;
        }
        return false;
    }

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

    public boolean useSpecialAbility(Player player, Object... params) {
        if (actionsRemaining <= 0) return false;
        
        switch (player.getType()) {
            case PILOT:
                return usePilotAbility(player, (Tile) params[0]);
            case ENGINEER:
                return useEngineerAbility(player, (List<Tile>) params[0]);
            case NAVIGATER:
                return useNavigatorAbility(player, (Player) params[0], (Tile) params[1]);
            case EXPLORER:
                return useExplorerAbility(player, (Tile) params[0]);
            case DRIVE:
                return useDiverAbility(player, (Tile) params[0]);
            case MESSENGER:
                return useMessengerAbility(player, (Player) params[0], (Card) params[1]);
            default:
                return false;
        }
    }

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

    private boolean isValidMove(Player player, Tile targetTile) {
        switch (player.getType()) {
            case EXPLORER:
                return isValidExplorerMove(player.getPosition(), targetTile);
            case PILOT:
                return true; // Pilot可以飞到任何地方
            default:
                return isValidNormalMove(player.getPosition(), targetTile);
        }
    }

    private boolean canCollectTreasure(Player player, TreasureType treasureType) {
        return player.getPosition().getTreasureType() == treasureType &&
               hasRequiredCards(player, treasureType);
    }

    private boolean canGiveCard(Player giver, Player receiver, Card card) {
        if (giver.getType() == PlayerType.MESSENGER) {
            return true; // Messenger可以远程送卡
        }
        return giver.getPosition() == receiver.getPosition();
    }

    private boolean usePilotAbility(Player player, Tile targetTile) {
        player.setPosition(targetTile);
        return true;
    }

    private boolean useEngineerAbility(Player player, List<Tile> tiles) {
        if (tiles.size() > 2) return false;
        for (Tile tile : tiles) {
            tile.drain();
        }
        return true;
    }

    private boolean useNavigatorAbility(Player navigator, Player targetPlayer, Tile targetTile) {
        if (isValidNormalMove(targetPlayer.getPosition(), targetTile)) {
            targetPlayer.setPosition(targetTile);
            return true;
        }
        return false;
    }

    private boolean useExplorerAbility(Player explorer, Tile targetTile) {
        if (isValidExplorerMove(explorer.getPosition(), targetTile)) {
            explorer.setPosition(targetTile);
            return true;
        }
        return false;
    }

    private boolean useDiverAbility(Player diver, Tile targetTile) {
        if (isValidDiverMove(diver.getPosition(), targetTile)) {
            diver.setPosition(targetTile);
            return true;
        }
        return false;
    }

    private boolean useMessengerAbility(Player messenger, Player targetPlayer, Card card) {
        messenger.removeCard(card);
        targetPlayer.addCard(card);
        return true;
    }

    private boolean isValidDiverMove(Tile current, Tile target) {
        if (target == null) {
            return false;
        }
        
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
    }

    public Player getCurrentPlayer() {
        return gameState.getCurrentPlayer();
    }

    public int getActionsRemaining() {
        return actionsRemaining;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public String getGameResult() {
        return gameResult;
    }

    public GameState getGameState() {
        return gameState;
    }

    private Tile getFoolsLanding() {
        for (Tile tile : gameState.getMap().getAllTiles()) {
            if (tile.isFoolsLanding()) {
                return tile;
            }
        }
        return null;
    }

    private boolean isPlayerTrapped(Player player) {
        Tile currentTile = player.getPosition();
        
        if (currentTile.isSink()) {
            return true;
        }
        
        List<Tile> adjacentTiles = gameState.getMap().getAdjacentTiles(currentTile);
        
        for (Tile adjacentTile : adjacentTiles) {
            if (adjacentTile != null && !adjacentTile.isSink()) {
                if (player.getType() == PlayerType.DRIVE) {
                    return false;
                }
                if (adjacentTile.isSafe()) {
                    return false;
                }
            }
        }
        
        return true;
    }

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

    private boolean isValidExplorerMove(Tile current, Tile target) {
        if (target == null || target.isSink()) {
            return false;
        }
        
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        return (dx <= 1 && dy <= 1) && !(dx == 0 && dy == 0);
    }

    private boolean isValidNormalMove(Tile current, Tile target) {
        if (target == null || target.isSink()) {
            return false;
        }
        
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
    }
}
