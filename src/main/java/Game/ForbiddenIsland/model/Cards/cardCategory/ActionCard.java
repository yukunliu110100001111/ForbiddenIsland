package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardActions.CardAction;
import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.util.ActionContext;

public class ActionCard extends Card {
    //this class is used to represent the action cards, for example, helicopter, sandbag, waterrise
    CardAction action;

    public ActionCard(int id,CardName name, CardType cardType, CardAction action) {
        super(id,name, cardType);
        this.action = action;
    }

    public void use(GameState gameState, ActionContext context) {
        this.action.execute(gameState, context);
    }
}