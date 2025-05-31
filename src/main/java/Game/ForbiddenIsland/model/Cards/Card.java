package Game.ForbiddenIsland.model.Cards;

import Game.ForbiddenIsland.model.TreasureType;

public class Card {
    private CardType type;
    private TreasureType treasureType; // only for treasure cards

    public Card(CardType type) {
        this.type = type;
    }

    public Card(CardType type, TreasureType treasureType) {
        this.type = type;
        this.treasureType = treasureType;
    }

    public CardType getType() {
        return type;
    }

    public TreasureType getTreasureType() {
        return treasureType;
    }
} 