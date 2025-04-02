package Game.ForbiddenIsland.model.CardActions;

import Game.ForbiddenIsland.model.GameState;

public class SandBag implements CardAction {
    @Override
    public void execute(GameState gameState) {
        System.out.println("SandBag");
    }
}
