package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.model.ActionContext;
import Game.ForbiddenIsland.model.GameState;

public class Flood implements CardAction {
    @Override
    public void execute(GameState gameState, ActionContext context) {
        System.out.println("Flood");
    }
}
