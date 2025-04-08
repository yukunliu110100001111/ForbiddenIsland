package Game.ForbiddenIsland.Main;

import Game.ForbiddenIsland.Pages.CoverPage;
import Game.ForbiddenIsland.Pages.GamePage;
import Game.ForbiddenIsland.Pages.MenuPage;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;

public class MainFrame extends JFrame {
    public static final String COVER_PAGE = "COVER";
    public static final String MENU_PAGE = "MENU";
    public static final String GAME_PAGE = "GAME";
    private static final double TARGET_RATIO = 4.0 / 3.0; // 目标宽高比
    private JPanel mainPanel;
    private CardLayout cardLayout;

    public MainFrame() {
        initializeUI();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new MainFrame().setVisible(true);
        });
    }

    private void initializeUI() {
        setTitle("Forbidden Island");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1200, 900); // 初始尺寸需符合目标比例
        setLocationRelativeTo(null);
        try {
            Image iconImage = Toolkit.getDefaultToolkit().getImage(
                    getClass().getResource("/Images/appicon.ico") // 或 "/images/app-icon.ico"
            );
            if (iconImage == null) {
                JOptionPane.showMessageDialog(this, "图标文件未找到！", "错误", JOptionPane.ERROR_MESSAGE);
            } else {
                setIconImage(iconImage);
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "图标加载失败: " + e.getMessage(), "错误", JOptionPane.ERROR_MESSAGE);
        }
        // 添加窗口大小监听器
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                enforceAspectRatio();
            }
        });

        cardLayout = new CardLayout();
        mainPanel = new JPanel(cardLayout);
        mainPanel.add(new CoverPage(this), COVER_PAGE);
        mainPanel.add(new MenuPage(this), MENU_PAGE);
        mainPanel.add(new GamePage(this), GAME_PAGE);
        add(mainPanel);
        switchToPage(COVER_PAGE);
    }

    private void enforceAspectRatio() {
        int width = getWidth();
        int height = getHeight();

        double currentRatio = (double) width / height;
        if (currentRatio > TARGET_RATIO) {
            height = (int) (width / TARGET_RATIO);
        } else {
            width = (int) (height * TARGET_RATIO);
        }

        // 避免递归触发事件
        removeComponentListener(getComponentListeners()[0]);
        setSize(width, height);
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                enforceAspectRatio();
            }
        });
    }

    public void switchToPage(String pageName) {
        cardLayout.show(mainPanel, pageName);
    }
}