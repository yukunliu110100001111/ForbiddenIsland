package Game.ForbiddenIsland.model.CardActions;

import Game.ForbiddenIsland.model.GameState;

public class Flood implements CardAction {
    @Override
    public void execute(GameState gameState) {
        System.out.println("Flood");
    }
}
