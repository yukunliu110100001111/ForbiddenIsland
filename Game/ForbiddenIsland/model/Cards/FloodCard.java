package Game.ForbiddenIsland.model.Cards;

import Game.ForbiddenIsland.model.*;

public class FloodCard extends Card {
    private final Tile targetTile;
    public FloodCard(Tile targetTile) {
        super(CardName.FLOOD, CardType.FLOOD);
        this.targetTile = targetTile;
    }

    public Tile getTargetTile() {
        return targetTile;
    }
    public void flood(){
        if (targetTile.isSafe()){
            targetTile.flood();
        }
        if(targetTile.isFlooded()){
            targetTile.sink();
        }
    }
}
