package Game.ForbiddenIsland.model;

public interface Deck {
    Card drawCard();
    void shuffle();
    void initialize();
}
