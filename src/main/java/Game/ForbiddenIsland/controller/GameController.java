package Game.ForbiddenIsland.controller;

import java.awt.Color;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
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
import Game.ForbiddenIsland.util.factory.PlayerFactory;
import Game.ForbiddenIsland.util.ActionContext;


// 11111

//11
public class GameController {
    private GameState gameState;
    private int currentPlayerIndex = 0;
    private int actionsRemaining = 3;
    private boolean gameOver = false;
    private String gameResult = "";
    private List<Card> treasureDeck;
    private List<Card> treasureDiscardPile;
    private List<Card> floodDeck;
    private List<Card> floodDiscardPile;
    private Random random = new Random();

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
    }

    private void initializeBoard() {
        Tile[][] board = new Tile[6][6];
        List<Tile> tiles = new ArrayList<>();
        
        // 创建Fools' Landing
        Tile foolsLanding = createTile(2, 2, null, true);
        board[2][2] = foolsLanding;
        tiles.add(foolsLanding);
        
        // 创建宝藏岛屿
        // Earth Stone (左上)
        board[0][0] = createTile(0, 0, TreasureType.EARTH, false);
        board[0][1] = createTile(0, 1, TreasureType.EARTH, false);
        tiles.add(board[0][0]);
        tiles.add(board[0][1]);
        
        // Wind Statue (右上)
        board[0][4] = createTile(0, 4, TreasureType.WIND, false);
        board[0][5] = createTile(0, 5, TreasureType.WIND, false);
        tiles.add(board[0][4]);
        tiles.add(board[0][5]);
        
        // Fire Crystal (左下)
        board[4][0] = createTile(4, 0, TreasureType.FIRE, false);
        board[5][0] = createTile(5, 0, TreasureType.FIRE, false);
        tiles.add(board[4][0]);
        tiles.add(board[5][0]);
        
        // Water Chalice (右下)
        board[4][4] = createTile(4, 4, TreasureType.WATER, false);
        board[5][5] = createTile(5, 5, TreasureType.WATER, false);
        tiles.add(board[4][4]);
        tiles.add(board[5][5]);
        
        // 创建其他普通岛屿
        for (int y = 0; y < 6; y++) {
            for (int x = 0; x < 6; x++) {
                if (board[y][x] == null) {
                    board[y][x] = createTile(x, y, null, false);
                    tiles.add(board[y][x]);
                }
            }
        }
        
        gameState.setBoard(tiles);
        gameState.setMap(new GameMap(board));
    }

    private Tile createTile(int x, int y, TreasureType treasureType, boolean isFoolsLanding) {
        Tile tile = new TileImp();
        tile.setPosition(x, y);
        tile.setTreasureType(treasureType);
        tile.setFoolsLanding(isFoolsLanding);
        tile.setName(getTileName(x, y, treasureType, isFoolsLanding));
        return tile;
    }

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
        // 初始化宝藏卡牌堆
        treasureDeck = new ArrayList<>();
        treasureDiscardPile = new ArrayList<>();
        
        // 添加宝藏卡（每种宝藏5张）
        for (TreasureType type : TreasureType.values()) {
            for (int i = 0; i < 5; i++) {
                treasureDeck.add(new TreasureCard(type));
            }
        }
        
        // 添加特殊卡
        // 3张直升机卡
        for (int i = 0; i < 3; i++) {
            treasureDeck.add(new ActionCard(CardName.HELICOPTER, CardType.HELICOPTER_LIFT, new Helicopter()));
        }
        // 2张沙袋卡
        for (int i = 0; i < 2; i++) {
            treasureDeck.add(new ActionCard(CardName.SANDBAG, CardType.SANDBAGS, new SandBag()));
        }
        // 3张水位上升卡
        for (int i = 0; i < 3; i++) {
            treasureDeck.add(new ActionCard(CardName.WATERRISE, CardType.WATERS_RISE, new WaterRise()));
        }
        
        // 洗牌
        Collections.shuffle(treasureDeck);
        
        // 初始化沉没卡牌堆
        floodDeck = new ArrayList<>();
        floodDiscardPile = new ArrayList<>();
        
        // 为每个岛屿创建一张沉没卡
        for (Tile tile : gameState.getMap().getAllTiles()) {
            floodDeck.add(new FloodCard(tile));
        }
        
        // 洗牌
        Collections.shuffle(floodDeck);
    }

    public void startTurn() {
        actionsRemaining = 3;
        checkGameState();
    }

    public void endTurn() {
        drawTreasureCards();
        drawFloodCards();
        checkGameState();
        nextPlayer();
    }

    private void drawTreasureCards() {
        Player currentPlayer = getCurrentPlayer();
        
        // 抽2张卡
        for (int i = 0; i < 2; i++) {
            if (treasureDeck.isEmpty()) {
                // 如果牌堆空了，重洗弃牌堆
                if (!treasureDiscardPile.isEmpty()) {
                    treasureDeck.addAll(treasureDiscardPile);
                    treasureDiscardPile.clear();
                    Collections.shuffle(treasureDeck);
                } else {
                    // 如果弃牌堆也空了，游戏结束
                    gameOver = true;
                    gameResult = "No more cards!";
                    return;
                }
            }
            
            Card drawnCard = treasureDeck.remove(0);
            
            // 检查是否是水位上升卡
            if (drawnCard instanceof ActionCard && drawnCard.getCardType() == CardType.WATERS_RISE) {
                ActionCard waterRiseCard = (ActionCard) drawnCard;
                ActionContext context = new ActionContext.Builder().build();
                waterRiseCard.use(gameState, context);
                treasureDiscardPile.add(drawnCard);
            } else {
                // 检查手牌上限
                if (currentPlayer.getHands().size() >= currentPlayer.getHandsSize()) {
                    // 手牌已满，必须弃牌
                    treasureDiscardPile.add(drawnCard);
                } else {
                    currentPlayer.addCard(drawnCard);
                }
            }
        }
    }

    private void drawFloodCards() {
        int cardsToDraw = gameState.getWaterLevel();
        
        for (int i = 0; i < cardsToDraw; i++) {
            if (floodDeck.isEmpty()) {
                // 如果牌堆空了，重洗弃牌堆
                if (!floodDiscardPile.isEmpty()) {
                    floodDeck.addAll(floodDiscardPile);
                    floodDiscardPile.clear();
                    Collections.shuffle(floodDeck);
                } else {
                    // 如果弃牌堆也空了，游戏结束
                    gameOver = true;
                    gameResult = "No more flood cards!";
                    return;
                }
            }
            
            Card drawnCard = floodDeck.remove(0);
            if (drawnCard instanceof FloodCard) {
                FloodCard floodCard = (FloodCard) drawnCard;
                floodCard.flood();
            }
            
            floodDiscardPile.add(drawnCard);
        }
    }

    public boolean movePlayer(Player player, Tile targetTile) {
        if (actionsRemaining <= 0) return false;
        
        if (isValidMove(player, targetTile)) {
            player.setPosition(targetTile);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    public boolean collectTreasure(Player player, TreasureType treasureType) {
        if (actionsRemaining <= 0) return false;
        
        if (canCollectTreasure(player, treasureType)) {
            gameState.setTreasureCollected(treasureType, true);
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
        if (checkWinCondition()) {
            gameOver = true;
            gameResult = "Victory!";
            return;
        }

        if (checkLoseCondition()) {
            gameOver = true;
            gameResult = "Defeat!";
            return;
        }
    }

    private boolean checkWinCondition() {
        // 检查是否收集了所有宝藏
        for (TreasureType type : TreasureType.values()) {
            if (!gameState.isTreasureCollected(type)) {
                return false;
            }
        }

        // 检查是否所有玩家都在Fools' Landing
        Tile foolsLanding = getFoolsLanding();
        for (Player player : gameState.getPlayers()) {
            if (player.getPosition() != foolsLanding) {
                return false;
            }
        }

        // 检查是否有直升机卡
        boolean hasHelicopterCard = false;
        for (Player player : gameState.getPlayers()) {
            for (Card card : player.getHands()) {
                if (card instanceof ActionCard && card.getCardType() == CardType.HELICOPTER_LIFT) {
                    hasHelicopterCard = true;
                    break;
                }
            }
        }

        return hasHelicopterCard;
    }

    private boolean checkLoseCondition() {
        // 检查水位
        if (gameState.getWaterLevel() >= 10) {
            return true;
        }

        // 检查Fools' Landing是否沉没
        if (gameState.getMap().isFoolsLandingSunk()) {
            return true;
        }

        // 检查是否有玩家被困
        for (Player player : gameState.getPlayers()) {
            if (isPlayerTrapped(player)) {
                return true;
            }
        }

        // 检查宝藏是否无法获取
        for (TreasureType type : TreasureType.values()) {
            if (gameState.getMap().isTreasureInaccessible(type)) {
                return true;
            }
        }

        return false;
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
            tile.setSink(false);
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
        return gameState.getPlayers().get(currentPlayerIndex);
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

    private void nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % gameState.getPlayers().size();
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
