package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.TreasureType;
import lombok.Getter;

@Getter
public class TreasureCard extends Card {
    // Treasure card
    private final TreasureType treasureType;
    public TreasureCard(int id,TreasureType type) {
        super(id,CardName.TREASURE, CardType.TREASURE);
        this.treasureType = type;
    }

}
