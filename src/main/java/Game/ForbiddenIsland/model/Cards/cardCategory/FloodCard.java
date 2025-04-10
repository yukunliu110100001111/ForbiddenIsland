package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;

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
        this.targetTile.flood();
    }
}
