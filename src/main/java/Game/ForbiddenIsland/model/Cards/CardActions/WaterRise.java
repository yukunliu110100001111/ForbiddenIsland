package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.util.ActionContext;

public class WaterRise implements CardAction {
    @Override
    public void execute(GameState gameState, ActionContext context) {
        gameState.waterRise();
    }
}
