package Game.ForbiddenIsland.model.Cards;

import Game.ForbiddenIsland.model.TreasureType;

public class TreasureCard extends Card {
    private final TreasureType treasureType;
    public TreasureCard(String name,TreasureType type) {
        super(name, CardType.TREASURE);
        this.treasureType = type;
    }

    public TreasureType getTreasureType() {
        return treasureType;
    }
}
