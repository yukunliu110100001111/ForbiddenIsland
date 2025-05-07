package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.util.ActionContext;
import Game.ForbiddenIsland.model.GameState;

public class WaterRise implements CardAction {
    @Override
    public void execute(GameState gameState, ActionContext context) {
        gameState.waterRise();
    }
}
