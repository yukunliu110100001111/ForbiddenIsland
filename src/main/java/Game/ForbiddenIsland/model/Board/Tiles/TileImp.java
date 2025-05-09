package Game.ForbiddenIsland.model.Board.Tiles;

import Game.ForbiddenIsland.model.TreasureType;

public class TileImp implements Tile{
    //this class is for the tile.
    private String name;
    private int x,y; //Position
    private TreasureType treasureType; //if the tile has a treasure.
    private boolean foolsLanding;  //check if the tile is fools landing.
    private TileState state = TileState.SAFE; //initial state is safe.

    public TileImp() {}
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getX() { return x; }
    public int getY() { return y; }
    public void setPosition(int x,int y) { this.x = x; this.y = y; }

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
