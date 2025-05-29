package Game.ForbiddenIsland.model.view;
import lombok.Data;
import Game.ForbiddenIsland.model.TreasureType;

/**
 * 用于前端传输的 Tile 视图对象，只包含基础字段，无循环引用。
 */
@Data  // Lombok 自动生成 getter/setter/toString/hashCode/equals
public class TileView {
    private String name;              // 格子名称
    private boolean foolsLanding;     // 是否为 Fools' Landing
    private int x;                    // 坐标 x
    private int y;                    // 坐标 y
    private String state;             // 状态: "SAFE", "FLOODED", "SINK"
    private TreasureType treasureType; // 宝藏类型, 如 EARTH、FIRE、WATER、WIND，可空

    // 构造器、getter/setter 由 Lombok 自动生成，无需手写
}
