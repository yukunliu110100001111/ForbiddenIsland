package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.Cards.CardName;

public class Tile {
    private TileState tileState;
    //Position of the tile
    private int x,y;

    public TileState getState(){
        return tileState;
    }
    public void flood() {
        this.tileState = TileState.FLOODED;
    }
    public void sink() {
        this.tileState = TileState.SINK;
    }
    public void drain(){
        if(this.tileState == TileState.FLOODED){
            this.tileState = TileState.SAFE;
        }
    }
    public boolean isSafe(){
        return this.tileState == TileState.SAFE;
    }
    public boolean isFlooded(){
        return this.tileState == TileState.FLOODED;
    }
    public boolean isSink(){
        return this.tileState == TileState.SINK;
    }
}
