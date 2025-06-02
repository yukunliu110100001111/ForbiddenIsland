package Game.ForbiddenIsland.model.view;
import lombok.Data;
import Game.ForbiddenIsland.model.TreasureType;

/**
 * Tile view  class, for transition  between model and view
 */
@Data  // Lombok 自动生成 getter/setter/toString/hashCode/equals
public class TileView {
    private String name;              // name of a tile
    private boolean foolsLanding;     // whether a  tile is Fools' Landing
    private int x;                    // position x
    private int y;                    // position
    private String state;             // state: "SAFE", "FLOODED", "SINK"
    private TreasureType treasureType; //

    // 确保isFoolsLanding方法可用于前端
    public boolean isFoolsLanding() {
        return foolsLanding;
    }
}
