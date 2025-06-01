package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import lombok.Getter;

@Getter
public class FloodCard extends Card {
    //this class is for flood card
    private final Tile targetTile;
    public FloodCard(Tile targetTile) {
        super(CardName.FLOOD, CardType.FLOOD);
        this.targetTile = targetTile;
    }

    public void flood(){
        this.targetTile.flood();
    }
}
