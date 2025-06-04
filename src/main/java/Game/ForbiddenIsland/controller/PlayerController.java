package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.ActionLogger;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerChoice;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.util.ActionContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletContext;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class PlayerController {
    private final GameController gameController;

    public PlayerController(GameController gameController) {
        this.gameController = gameController;

    }

    public void receiveAndAllocate(String json, ServletContext ctx) {
        ActionContext actionContext = parseJsonToActionContext(json);
        ActionLogger logger = (ActionLogger) ctx.getAttribute("actionLogger");
        if (actionContext == null) {
            System.err.println("[PlayerController] interpret ActionContext fail，receive json: " + json);
            return;
        }
        System.out.println("[PlayerController] receive action: " + actionContext.getPlayerChoice()
                + " | player: " + (actionContext.getTargetPlayers().isEmpty() ? "-" : actionContext.getTargetPlayers().getFirst().getType())
                + " | target tile: " + (actionContext.getTargetTile() == null ? "null" :
                actionContext.getTargetTile().getX() + "," + actionContext.getTargetTile().getY())
                + " | other card/treasure card: " + actionContext.getTargetCard() + "/" + actionContext.getTreasureType()
        );
        switch (actionContext.getPlayerChoice()) {
            case MOVE:
                if (movePlayer(actionContext)) {
                    decAction();
                    logger.log("Player " + "-" + actionContext.getTargetPlayers().getFirst().getType() + " moved");
                }
                break;
            case SHORE_UP:
                if (shoreUp(actionContext)) {
                    decAction();
                    logger.log("Player " + "-" + actionContext.getTargetPlayers().getFirst().getType() + " shore up");
                }
                break;
            case COLLECT_TREASURE:
                if (collectTreasure(actionContext)) {
                    decAction();
                    logger.log("Player " + "-" + actionContext.getTargetPlayers().getFirst().getType() + " collect treasure");
                }
                break;
            case GIVE_CARD:
                if (giveCard(actionContext)) {
                    decAction();
                    Player receiver = actionContext.getTargetPlayers().get(0);
                    Card card = actionContext.getTargetCard();
                }
                break;
            case USE_CARD:
                useCard(actionContext);
                logger.log("Player " + "-" + actionContext.getTargetPlayers().getFirst().getType() + " use card");
                break;
            case DISCARD_CARD:
                if (discard(actionContext)) {
                    // 只有当卡片成功弃掉时才记录日志
                    logger.log("Player " + "-" + actionContext.getTargetPlayers().getFirst().getType() + " discarded card");
                }
                break;
            case END_TURN:
                endTurn();
                logger.log("Player " + "-" + actionContext.getTargetPlayers().getFirst().getType() + " end turn");
                break;
            default:
                System.err.println("[PlayerController] unknown movement: " + actionContext.getPlayerChoice());
        }
    }

    /**
     * reduce a player's action, if zero end turn
     */
    private void decAction() {
        GameState gs = gameController.getGameState();
        int left = gs.getActionsLeft() - 1;
        gs.setActionsLeft(left);
        System.out.println("[PlayerController] reduce action numbers, remaining: " + left);
        if (left <= 0) {
            System.out.println("[PlayerController] end turn");
            endTurn();
        }
    }

    public ActionContext parseJsonToActionContext(String json) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(json);

            String choiceStr = root.has("action") ? root.get("action").asText() :
                    root.has("playerChoice") ? root.get("playerChoice").asText() : null;
            if (choiceStr == null) return null;
            PlayerChoice choice = PlayerChoice.valueOf(choiceStr.toUpperCase());

            Tile tile = null;
            if (root.has("x") && root.has("y")) {
                int x = root.get("x").asInt();
                int y = root.get("y").asInt();
                tile = gameController.getGameState().getTileAt(x, y);
            } else if (root.has("targetTile")) {
                String str = root.get("targetTile").asText();
                if (!"null".equals(str)) {
                    String[] parts = str.split(",");
                    int x = Integer.parseInt(parts[0].trim());
                    int y = Integer.parseInt(parts[1].trim());
                    tile = gameController.getGameState().getTileAt(x, y);
                }
            }

            List<Player> players = new ArrayList<>();
            if (root.has("targetPlayers")) {
                for (JsonNode nameNode : root.get("targetPlayers")) {
                    Player p = gameController.getGameState().findPlayerByName(nameNode.asInt());
                    if (p != null) players.add(p);
                }
            }

            if (players.isEmpty()) {
                players.add(gameController.getGameState().getCurrentPlayer());
            }

            Card card = null;
            if (root.has("cardId")) {
                card = gameController.getGameState().getCardById(root.get("cardId").asInt());
            } else if (root.has("targetCard")) {
                card = gameController.getGameState().getCardById(root.get("targetCard").asInt());
            }

            TreasureType treasureType = null;
            if (root.has("treasureType") && !root.get("treasureType").isNull()) {
                treasureType = TreasureType.valueOf(root.get("treasureType").asText());
            }


            return new ActionContext.Builder()
                    .setPlayerChoice(choice)
                    .setTargetPlayers(players)
                    .setTargetTile(tile)
                    .setTargetCard(card)
                    .setTreasureType(treasureType)
                    .build();
        } catch (Exception e) {
            System.err.println("[PlayerController] parseJsonToActionContext fail to interpret: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean movePlayer(ActionContext actionContext) {
        if (gameController.getGameState().getActionsLeft() <= 0) {
            System.out.println("[PlayerController] no actions remain, skip move");
            return false;
        }
        Player player = actionContext.getTargetPlayers().get(0);
        Tile targetTile = actionContext.getTargetTile();
        System.out.println("[PlayerController] execute movePlayer: "
                + player.getType() + " -> (" + targetTile.getX() + "," + targetTile.getY() + ")");
        return gameController.movePlayer(player, targetTile);
    }

    public boolean shoreUp(ActionContext actionContext) {
        System.out.println("[PlayerController] shoreUp: " + actionContext.getTargetTile());
        gameController.shoreUp(actionContext.getTargetTile());
        return true;
    }

    public boolean collectTreasure(ActionContext actionContext) {
        System.out.println("[PlayerController] collectTreasure: " + actionContext.getTreasureType());
        return gameController.collectTreasure(gameController.getCurrentPlayer(), actionContext.getTreasureType());
    }

    // PlayerController.java

    public boolean giveCard(ActionContext actionContext) {
        Player receiver = actionContext.getTargetPlayers().get(1);
        Player giver = gameController.getGameState().getCurrentPlayer();
        Card card = actionContext.getTargetCard();

        System.out.println("[PlayerController] giveCard: "
                + giver.getType() + " -> " + receiver.getType()
                + " card=" + card);

        return gameController.giveCard(giver, receiver, card);
    }




    public boolean useCard(ActionContext actionContext) {
        // 先拿到原始的 Card
        Card raw = actionContext.getTargetCard();
        // 如果不是特殊卡，就直接返回 false
        if (!(raw instanceof ActionCard)) {
            System.err.println("[PlayerController] useCard: 不是特殊卡，无法使用 → " + raw);
            return false;
        }
        // 安全地转换
        ActionCard card = (ActionCard) raw;
        System.out.println("[PlayerController] useCard: " + card);
        // 真正执行使用逻辑
        gameController.useCards(card, actionContext);
        return true;
    }

    public boolean discard(ActionContext actionContext) {
        if (actionContext.getTargetCard() == null) {
            System.err.println("[discard] 目标卡片为null");
            return false;
        }
        int cardId = actionContext.getTargetCard().getCardId();
        Player player = actionContext.getTargetPlayers().getFirst();
        List<Card> hand = player.getHands();
        // 先检查这张卡是否存在于手牌中
        boolean cardExists = false;
        for (Card c : hand) {
            if (c.getCardId() == cardId) {
                cardExists = true;
                break;
            }
        }
        if (!cardExists) {
            System.err.println("[discard] 未找到 cardId = " + cardId + " 的卡，手牌列表: " + hand);
            return false;
        }
        // 使用Iterator安全地移除卡片
        Iterator<Card> it = hand.iterator();
        while (it.hasNext()) {
            Card c = it.next();
            if (c.getCardId() == cardId) {
                it.remove(); // 真正移除
                gameController.getGameState().discardTreasure(c);
                return true;
            }
        }
        return false;
    }



    public boolean endTurn() {
        System.out.println("[PlayerController] trigger endTurn");
        gameController.endTurn();
        return true;
    }
}
