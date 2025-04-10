package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.TreasureType;

public class TreasureCard extends Card {
    private final TreasureType treasureType;
    public TreasureCard(TreasureType type) {
        super(CardName.TREASURE, CardType.TREASURE);
        this.treasureType = type;
    }

    public TreasureType getTreasureType() {
        return treasureType;
    }
}
