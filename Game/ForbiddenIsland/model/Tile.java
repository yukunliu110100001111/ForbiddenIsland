package Game.ForbiddenIsland.model;

public class Tile {
    TileState state = TileState.SAFE;
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
