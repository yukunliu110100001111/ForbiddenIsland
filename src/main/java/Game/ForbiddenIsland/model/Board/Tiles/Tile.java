package Game.ForbiddenIsland.model.Board.Tiles;

import src.main.java.Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.model.Board.Tiles.TileState;

public class Tile {
    private String name;
    private TreasureType treasureType;
    private boolean foolsLanding;
    TileState state = TileState.SAFE;

    public Tile() {}
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public TreasureType getTreasureType() { return treasureType; }
    public void setTreasureType(TreasureType treasureType) { this.treasureType = treasureType; }

    public boolean isFoolsLanding() { return foolsLanding; }
    public void setFoolsLanding(boolean foolsLanding) { this.foolsLanding = foolsLanding; }

    public TileState getState(){
        return this.state;
    }
    public void flood(){
        if(this.state == TileState.SAFE){
            this.state = TileState.FLOODED;
        }
        else if(this.state == TileState.FLOODED){
            this.state = TileState.SINK;
        }
    }
    public void drain(){
        this.state = TileState.SAFE;
    }
    public boolean isSafe(){
        return this.state == TileState.SAFE;
    }
    public boolean isFlooded(){
        return this.state == TileState.FLOODED;
    }
    public boolean isSink(){
        return this.state == TileState.SINK;
    }
}
