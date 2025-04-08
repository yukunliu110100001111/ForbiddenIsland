package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.model.ActionContext;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.PlayerImp;

public class Helicopter implements CardAction {
    @Override
    public void execute(GameState gameState, ActionContext context) {
        PlayerImp player = context.getTargetPlayers().get(0);
        player.setPosition(context.getTargetTile());
    }
}
