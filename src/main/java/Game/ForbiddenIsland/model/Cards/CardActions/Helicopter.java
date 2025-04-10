package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.util.ActionContext;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;

public class Helicopter implements CardAction {
    @Override
    public void execute(GameState gameState, ActionContext context) {
        Player player = context.getTargetPlayers().get(0);
        player.setPosition(context.getTargetTile());
    }
}
