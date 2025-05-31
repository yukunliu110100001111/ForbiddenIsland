package Game.ForbiddenIsland.model.Board.Tiles;

import Game.ForbiddenIsland.model.TreasureType;
import lombok.Getter;
import lombok.Setter;

@Getter
public class TileImp implements Tile{
    //this class is for the tile.
    @Setter
    private String name;
    private int x,y; //Position
    @Setter
    private TreasureType treasureType; //if the tile has a treasure.
    @Setter
    private boolean foolsLanding;  //check if the tile is fools landing.
    private TileState state = TileState.SAFE; //initial state is safe.

    public TileImp() {}

    public void setPosition(int x,int y) { this.x = x; this.y = y; }


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
    // check if the tile is safe, flooded or sink.
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
