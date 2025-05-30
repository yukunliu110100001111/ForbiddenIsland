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

    // --- 新增字段 ---
    private int actionsLeft;                    // 当前回合剩余行动数
    private boolean gameWon;
    private boolean gameLost;
    private List<Card> recentTreasureDraws;     // 最近抽到的宝藏牌
    private List<FloodCard> recentFloodDraws;   // 最近抽到的洪水牌

    // ====== 你要加的两个字段 ======
    private int treasureDeckRemaining;          // 宝藏牌堆剩余数量
    private int floodDeckRemaining;             // 洪水牌堆剩余数量

    // 你也可以加其他前端状态需要的字段
}

