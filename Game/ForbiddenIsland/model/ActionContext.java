package Game.ForbiddenIsland.model;


import Game.ForbiddenIsland.model.Players.Player;

import java.util.List;
import java.util.Map;

public class ActionContext {
    private List<Player> targetPlayers;
    private Tile targetTile;
    private Map<String, Object> metadata;

    public ActionContext(List<Player> targetPlayers, Tile targetTile) {
        this.targetPlayers = targetPlayers;
        this.targetTile = targetTile;
    }

    public List<Player> getTargetPlayers() {
        return targetPlayers;
    }

    public Tile getTargetTile() {
        return targetTile;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public Object get(String key) {
        return metadata != null ? metadata.get(key) : null;
    }
}