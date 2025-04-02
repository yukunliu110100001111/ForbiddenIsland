package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.CardActions.CardAction;

public class ActionCard extends Card {
    CardAction action;
    public void action(GameState gameState) {
        this.action.execute(gameState);
    }
}