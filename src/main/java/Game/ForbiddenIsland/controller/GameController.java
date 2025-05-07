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
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerType;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.util.factory.PlayerFactory;

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
        Tile startingTile = getFoolsLanding(); // 假设所有玩家从Fools' Landing开始
        
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
                treasureDeck.add(new Card(CardName.TREASURE, CardType.TREASURE));
            }
        }
        
        // 添加特殊卡
        // 3张直升机卡
        for (int i = 0; i < 3; i++) {
            treasureDeck.add(new Card(CardName.HELICOPTER, CardType.HELICOPTER_LIFT));
        }
        // 2张沙袋卡
        for (int i = 0; i < 2; i++) {
            treasureDeck.add(new Card(CardName.SANDBAG, CardType.SANDBAGS));
        }
        // 3张水位上升卡
        for (int i = 0; i < 3; i++) {
            treasureDeck.add(new Card(CardName.WATERRISE, CardType.WATERS_RISE));
        }
        
        // 洗牌
        Collections.shuffle(treasureDeck);
        
        // 初始化沉没卡牌堆
        floodDeck = new ArrayList<>();
        floodDiscardPile = new ArrayList<>();
        
        // 为每个岛屿创建一张沉没卡
        for (Tile tile : gameState.getMap().getAllTiles()) {
            floodDeck.add(new Card(CardName.FLOOD, CardType.FLOOD));
        }
        
        // 洗牌
        Collections.shuffle(floodDeck);
    }

    public void startTurn() {
        actionsRemaining = 3;
        // 检查游戏状态
        checkGameState();
    }

    public void endTurn() {
        // 抽宝藏卡
        drawTreasureCards();
        // 抽沉没卡
        drawFloodCards();
        // 检查游戏状态
        checkGameState();
        // 切换到下一个玩家
        nextPlayer();
    }

    public boolean movePlayer(Player player, Tile targetTile) {
        if (actionsRemaining <= 0) return false;
        
        // 检查移动是否合法
        if (isValidMove(player, targetTile)) {
            player.setPosition(targetTile);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    public boolean collectTreasure(Player player, TreasureType treasureType) {
        if (actionsRemaining <= 0) return false;
        
        // 检查是否满足收集条件
        if (canCollectTreasure(player, treasureType)) {
            gameState.setTreasureCollected(treasureType, true);
            actionsRemaining--;
            return true;
        }
        return false;
    }

    public boolean giveCard(Player giver, Player receiver, Card card) {
        if (actionsRemaining <= 0) return false;
        
        // 检查是否满足送卡条件
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
        // 检查胜利条件
        if (checkWinCondition()) {
            gameOver = true;
            gameResult = "Victory!";
            return;
        }

        // 检查失败条件
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
                if (card.getCardType() == CardType.HELICOPTER_LIFT) {
                    hasHelicopterCard = true;
                    break;
                }
            }
        }

        return hasHelicopterCard;
    }

    private boolean checkLoseCondition() {
        // 检查水位
        if (gameState.getWaterLevel() >= 10) { // 假设10是最高水位
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
        // 根据玩家类型检查移动是否合法
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
        // 检查玩家位置和手牌
        return player.getPosition().getTreasureType() == treasureType &&
               hasRequiredCards(player, treasureType);
    }

    private boolean canGiveCard(Player giver, Player receiver, Card card) {
        // 检查送卡条件
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
        // Navigator可以让其他玩家移动最多2格
        if (isValidNormalMove(targetPlayer.getPosition(), targetTile)) {
            targetPlayer.setPosition(targetTile);
            return true;
        }
        return false;
    }

    private boolean useExplorerAbility(Player explorer, Tile targetTile) {
        // Explorer可以斜着移动
        if (isValidExplorerMove(explorer.getPosition(), targetTile)) {
            explorer.setPosition(targetTile);
            return true;
        }
        return false;
    }

    private boolean useDiverAbility(Player diver, Tile targetTile) {
        // Diver可以穿越连续的沉没/缺失格子
        if (isValidDiverMove(diver.getPosition(), targetTile)) {
            diver.setPosition(targetTile);
            return true;
        }
        return false;
    }

    private boolean useMessengerAbility(Player messenger, Player targetPlayer, Card card) {
        // Messenger可以远程送卡
        messenger.removeCard(card);
        targetPlayer.addCard(card);
        return true;
    }

    private boolean isValidDiverMove(Tile current, Tile target) {
        // 检查目标格子是否有效
        if (target == null) {
            return false;
        }
        
        // 计算当前位置和目标位置的距离
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        // 潜水员可以穿越连续的沉没/淹没格子
        // 这里简化处理，允许潜水员移动到任何相邻格子
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
            if (drawnCard.getCardType() == CardType.WATERS_RISE) {
                handleWatersRise();
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
            // 随机选择一个岛屿
            List<Tile> allTiles = gameState.getMap().getAllTiles();
            Tile targetTile = allTiles.get(random.nextInt(allTiles.size()));
            
            // 处理沉没卡效果
            if (targetTile.isSafe()) {
                targetTile.flood();
            } else if (targetTile.isFlooded()) {
                targetTile.setSink(true);
            }
            
            floodDiscardPile.add(drawnCard);
        }
    }

    private void handleWatersRise() {
        // 水位上升
        gameState.waterRise();
        
        // 重洗沉没弃牌堆
        if (!floodDiscardPile.isEmpty()) {
            floodDeck.addAll(floodDiscardPile);
            floodDiscardPile.clear();
            Collections.shuffle(floodDeck);
        }
    }

    private Tile getFoolsLanding() {
        // 遍历所有格子找到Fools' Landing
        for (Tile tile : gameState.getMap().getAllTiles()) {
            if (tile.isFoolsLanding()) {
                return tile;
            }
        }
        return null;
    }

    private boolean isPlayerTrapped(Player player) {
        Tile currentTile = player.getPosition();
        
        // 如果当前格子已经沉没，玩家被困
        if (currentTile.isSink()) {
            return true;
        }
        
        // 获取所有相邻格子
        List<Tile> adjacentTiles = gameState.getMap().getAdjacentTiles(currentTile);
        
        // 检查是否有任何可移动到的格子
        for (Tile adjacentTile : adjacentTiles) {
            if (adjacentTile != null && !adjacentTile.isSink()) {
                // 如果是潜水员，可以移动到被淹没的格子
                if (player.getType() == PlayerType.DRIVE) {
                    return false;
                }
                // 其他角色只能移动到安全的格子
                if (adjacentTile.isSafe()) {
                    return false;
                }
            }
        }
        
        // 如果没有可移动到的格子，玩家被困
        return true;
    }

    private boolean hasRequiredCards(Player player, TreasureType type) {
        // 统计玩家手牌中对应宝藏类型的卡片数量
        int count = 0;
        for (Card card : player.getHands()) {
            if (card.getCardType() == CardType.TREASURE && 
                card.getCardName().toString().equals(type.toString())) {
                count++;
            }
        }
        // 需要4张相同类型的宝藏卡才能收集宝藏
        return count >= 4;
    }

    private boolean isValidExplorerMove(Tile current, Tile target) {
        // 检查目标格子是否有效
        if (target == null || target.isSink()) {
            return false;
        }
        
        // 计算当前位置和目标位置的距离
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        // 探险家可以斜着移动
        return (dx <= 1 && dy <= 1) && !(dx == 0 && dy == 0);
    }

    private boolean isValidNormalMove(Tile current, Tile target) {
        // 检查目标格子是否有效
        if (target == null || target.isSink()) {
            return false;
        }
        
        // 计算当前位置和目标位置的距离
        int dx = Math.abs(current.getX() - target.getX());
        int dy = Math.abs(current.getY() - target.getY());
        
        // 只能移动到相邻的格子（上下左右）
        return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
    }
}
