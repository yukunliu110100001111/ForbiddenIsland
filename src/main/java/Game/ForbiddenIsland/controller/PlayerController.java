package Game.ForbiddenIsland.controller;

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

import java.util.ArrayList;
import java.util.List;

public class PlayerController {
    private final GameController gameController;

    public PlayerController(GameController gameController) {
        this.gameController = gameController;
    }

    public void receiveAndAllocate(String json) {
        ActionContext actionContext = parseJsonToActionContext(json);
        if (actionContext == null) {
            System.err.println("[PlayerController] 解析 ActionContext 失败，收到 json: " + json);
            return;
        }
        System.out.println("[PlayerController] 收到 action: " + actionContext.getPlayerChoice()
                + " | 玩家: " + (actionContext.getTargetPlayers().isEmpty() ? "-" : actionContext.getTargetPlayers().get(0).getType())
                + " | 目标 tile: " + (actionContext.getTargetTile() == null ? "null" :
                actionContext.getTargetTile().getX() + "," + actionContext.getTargetTile().getY())
                + " | 其它卡/宝藏: " + actionContext.getTargetCard() + "/" + actionContext.getTreasureType()
        );
        switch (actionContext.getPlayerChoice()) {
            case MOVE:
                if (movePlayer(actionContext)) decAction();
                break;
            case SHORE_UP:
                if (shoreUp(actionContext)) decAction();
                break;
            case COLLECT_TREASURE:
                if (collectTreasure(actionContext)) decAction();
                break;
            case GIVE_CARD:
                if (giveCard(actionContext)) decAction();
                break;
            case USE_CARD:
                useCard(actionContext);
                break;
            case END_TURN:
                endTurn();
                break;
            default:
                System.err.println("[PlayerController] 未知操作: " + actionContext.getPlayerChoice());
        }
    }

    /**
     * 减少一次行动数，并在行动数耗尽时自动结束回合
     */
    private void decAction() {
        GameState gs = gameController.getGameState();
        int left = gs.getActionsLeft() - 1;
        gs.setActionsLeft(left);
        System.out.println("[PlayerController] 行动数 -1, 剩余: " + left);
        if (left <= 0) {
            System.out.println("[PlayerController] 行动耗尽，自动结束回合");
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
            if (root.has("playerIndex")) {
                int idx = root.get("playerIndex").asInt();
                players.add(gameController.getGameState().getPlayers().get(idx));
            } else if (root.has("targetPlayers")) {
                for (JsonNode nameNode : root.get("targetPlayers")) {
                    Player p = gameController.getGameState().findPlayerByName(nameNode.asInt());
                    if (p != null) players.add(p);
                }
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
            System.err.println("[PlayerController] parseJsonToActionContext 解析失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean movePlayer(ActionContext actionContext) {
        if (gameController.getGameState().getActionsLeft() <= 0) {
            System.out.println("[PlayerController] 无剩余行动，跳过 move");
            return false;
        }
        Player player = actionContext.getTargetPlayers().get(0);
        Tile targetTile = actionContext.getTargetTile();
        System.out.println("[PlayerController] 执行 movePlayer: "
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

    public boolean giveCard(ActionContext actionContext) {
        Player giver = actionContext.getTargetPlayers().get(0);
        Player receiver = actionContext.getTargetPlayers().get(1);
        Card card = actionContext.getTargetCard();
        System.out.println("[PlayerController] giveCard: "
                + giver.getType() + "->" + receiver.getType() + " card=" + card);
        return gameController.giveCard(giver, receiver, card);
    }

    public boolean useCard(ActionContext actionContext) {
        ActionCard card = (ActionCard) actionContext.getTargetCard();
        System.out.println("[PlayerController] useCard: " + card);
        gameController.useCards(card, actionContext);
        return true;
    }

    public boolean endTurn() {
        System.out.println("[PlayerController] 触发 endTurn");
        gameController.endTurn();
        return true;
    }
}
