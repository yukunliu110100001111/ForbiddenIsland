package Game.ForbiddenIsland.Pages;

import Game.ForbiddenIsland.Main.MainFrame;

import javax.swing.*;
import java.awt.*;

public class GamePage extends JPanel {
    private final MainFrame mainFrame;

    public GamePage(MainFrame frame) {
        this.mainFrame = frame;
        setupUI();
    }

    private void setupUI() {
        setLayout(new BorderLayout());
        setBackground(Color.DARK_GRAY);

        // 示例：返回菜单按钮
        JButton backButton = new JButton("Back to Menu");
        backButton.addActionListener(e -> mainFrame.switchToPage(MainFrame.MENU_PAGE));
        add(backButton, BorderLayout.NORTH);

        // 游戏主内容区域（后续可添加具体游戏组件）
        JLabel gameContent = new JLabel("GAME CONTENT AREA", SwingConstants.CENTER);
        gameContent.setForeground(Color.WHITE);
        gameContent.setFont(new Font("Arial", Font.PLAIN, 24));
        add(gameContent, BorderLayout.CENTER);
    }
}