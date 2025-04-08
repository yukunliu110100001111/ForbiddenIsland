package Game.ForbiddenIsland.Pages;

import src.main.resources.Font.FontLoader;
import Game.ForbiddenIsland.Main.MainFrame;

import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.plaf.basic.BasicSliderUI;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.IOException;

public class MenuPage extends JPanel {
    private MainFrame mainFrame;
    private JButton startButton;
    private JSlider playerSlider;
    private JSlider difficultySlider;
    private BufferedImage backgroundImage;

    public MenuPage(MainFrame frame) {
        this.mainFrame = frame;
        loadBackgroundImage();
        setupUI();
    }

    private void loadBackgroundImage() {
        try {
            backgroundImage = ImageIO.read(getClass().getResource("/Images/coverbg.png"));
        } catch (IOException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "无法加载背景图片！", "错误", JOptionPane.ERROR_MESSAGE);
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (backgroundImage != null) {
            g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
        }
        Graphics2D g2d = (Graphics2D) g.create();
        g2d.setColor(new Color(0, 0, 0, 180));
        g2d.fillRect(0, 0, getWidth(), getHeight());
        g2d.dispose();
    }

    private void setupUI() {
        setLayout(new BorderLayout());
        setOpaque(false);

        JPanel centerPanel = new JPanel(new GridBagLayout());
        centerPanel.setOpaque(false);
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 10, 2, 10); // 更紧凑的间距
        gbc.gridx = 0;
        gbc.anchor = GridBagConstraints.CENTER;

        // 移除标题从 centerPanel，已转移至 BorderLayout.NORTH
        gbc.insets = new Insets(5, 10, 2, 10);

        // Player slider
        JLabel playerLabel = new JLabel("Players");
        playerLabel.setForeground(Color.WHITE);
        playerLabel.setFont(FontLoader.loadFont("/Font/MedievalSharp-Regular.ttf", 36f));
        gbc.gridy = 1;
        centerPanel.add(playerLabel, gbc);

        playerSlider = createCustomSlider(2, 4, 2);
        playerSlider.setFocusable(false);
        gbc.gridy = 2;
        centerPanel.add(playerSlider, gbc);

        JLabel playerOptions = new JLabel("<html><div style='text-align:center; width:500px;'>2 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4</div></html>");
        playerOptions.setForeground(Color.LIGHT_GRAY);
        playerOptions.setFont(FontLoader.loadFont("/Font/MedievalSharp-Regular.ttf", 25f));
        gbc.gridy = 3;
        centerPanel.add(playerOptions, gbc);
        playerSlider.addChangeListener(e -> {
            int value = playerSlider.getValue();
            String style = "font-size:30pt; color:white; text-shadow:2px 2px 3px black;";
            String html = "<html><div style='text-align:center; width:500px;'>"
                    + (value == 2 ? "<span style='" + style + "'>2</span>" : "2") +
                    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                    + (value == 3 ? "<span style='" + style + "'>3</span>" : "3") +
                    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                    + (value == 4 ? "<span style='" + style + "'>4</span>" : "4") +
                    "</div></html>";
            playerOptions.setText(html);
        });
        playerSlider.setValue(playerSlider.getValue());

        // Difficulty slider
        JLabel difficultyLabel = new JLabel("Difficulty");
        difficultyLabel.setForeground(Color.WHITE);
        difficultyLabel.setFont(FontLoader.loadFont("/Font/MedievalSharp-Regular.ttf", 36f));
        gbc.gridy = 4;
        centerPanel.add(difficultyLabel, gbc);

        difficultySlider = createCustomSlider(1, 4, 1);
        difficultySlider.setFocusable(false);
        gbc.gridy = 5;
        centerPanel.add(difficultySlider, gbc);

        JLabel diffOptions = new JLabel("<html><div style='text-align:center; width:500px;'>Novice &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Elite &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Legendary</div></html>");
        diffOptions.setForeground(Color.LIGHT_GRAY);
        diffOptions.setFont(FontLoader.loadFont("/Font/MedievalSharp-Regular.ttf", 25f));
        gbc.gridy = 6;
        centerPanel.add(diffOptions, gbc);
        difficultySlider.addChangeListener(e -> {
            int value = difficultySlider.getValue();
            String style = "font-size:30pt; color:white; text-shadow:1px 1px 2px black;";
            String html = "<html><div style='text-align:center; width:500px;'>"
                    + (value == 1 ? "<span style='" + style + "'>Novice</span>" : "Novice") +
                    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                    + (value == 2 ? "<span style='" + style + "'>Normal</span>" : "Normal") +
                    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                    + (value == 3 ? "<span style='" + style + "'>Elite</span>" : "Elite") +
                    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                    + (value == 4 ? "<span style='" + style + "'>Legendary</span>" : "Legendary") +
                    "</div></html>";
            diffOptions.setText(html);
        });
        difficultySlider.setValue(difficultySlider.getValue());

        startButton = new JButton("Start Game") {
            private boolean hovering = false;

            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, hovering ? 0.7f : 0.5f));
                g2.setColor(new Color(255, 255, 255, 180));
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 30, 30);
                g2.setComposite(AlphaComposite.SrcOver);
                super.paintComponent(g2);
                g2.dispose();
            }

            @Override
            protected void processMouseEvent(java.awt.event.MouseEvent e) {
                if (e.getID() == java.awt.event.MouseEvent.MOUSE_ENTERED) hovering = true;
                else if (e.getID() == java.awt.event.MouseEvent.MOUSE_EXITED) hovering = false;
                repaint();
                super.processMouseEvent(e);
            }
        };
        startButton.setFont(FontLoader.loadFont("/Font/MedievalSharp-Regular.ttf", 28f));
        startButton.setCursor(new Cursor(Cursor.HAND_CURSOR));
        startButton.setOpaque(true);
        startButton.setContentAreaFilled(true);
        startButton.setBorderPainted(false);
        startButton.setForeground(Color.BLACK);
        startButton.setEnabled(false);
        startButton.addActionListener(e -> {
            startButton.setEnabled(false);
            startButton.setText("Loading...");
            Timer timer = new Timer(1000, evt -> {
                mainFrame.switchToPage(MainFrame.GAME_PAGE);
            });
            timer.setRepeats(false);
            timer.start();
        });
        gbc.gridy = 8;
        // 将 Start Game 移到底部单独区域
        JPanel bottomPanel = new JPanel();
        bottomPanel.setOpaque(false);
        bottomPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 0, 10));
        bottomPanel.add(startButton);
        add(bottomPanel, BorderLayout.SOUTH);
        gbc.insets = new Insets(5, 10, 2, 10);

        // 拆分布局区域
        JPanel titlePanel = new JPanel();
        titlePanel.setOpaque(false);
        titlePanel.setLayout(new FlowLayout(FlowLayout.CENTER, 0, 30));
        JLabel title = new JLabel("MAIN MENU");
        title.setFont(FontLoader.loadFont("/Font/MedievalSharp-Regular.ttf", 72f));
        title.setForeground(Color.WHITE);
        titlePanel.add(title);
        add(titlePanel, BorderLayout.NORTH);

        // 添加齿轮设置按钮并放置在 titlePanel 中右上角
        JButton settingsButton = new JButton("⚙");
        settingsButton.setFont(new Font("SansSerif", Font.BOLD, 26));
        settingsButton.setOpaque(false);
        settingsButton.setContentAreaFilled(false);
        settingsButton.setBorderPainted(false);
        settingsButton.setForeground(Color.WHITE);

        JPanel gearWrapper = new JPanel(new FlowLayout(FlowLayout.RIGHT, 20, 10));
        gearWrapper.setOpaque(false);
        gearWrapper.add(settingsButton);

        JPanel topBarPanel = new JPanel(new BorderLayout());
        topBarPanel.setOpaque(false);
        topBarPanel.add(titlePanel, BorderLayout.CENTER);
        topBarPanel.add(gearWrapper, BorderLayout.EAST);

        add(topBarPanel, BorderLayout.NORTH);

        SettingsOverlay overlay = new SettingsOverlay();
        settingsButton.addActionListener(e -> {
            int centerX = (getWidth() - overlay.getPreferredSize().width) / 2;
            int centerY = (getHeight() - overlay.getPreferredSize().height) / 2;
            overlay.show(this, centerX, centerY);
        });

        add(centerPanel, BorderLayout.CENTER);

        playerSlider.addChangeListener(e -> checkSelections());
        difficultySlider.addChangeListener(e -> checkSelections());
    }

    private JSlider createCustomSlider(int min, int max, int init) {
        JSlider slider = new JSlider(JSlider.HORIZONTAL, min, max, init);
        slider.setOpaque(false);
        slider.setPreferredSize(new Dimension(500, 60));
        slider.setUI(new BasicSliderUI(slider) {
            @Override
            public void paintTrack(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                // 蓝色背景轨道，两边圆角
                g2.setPaint(new Color(30, 144, 255)); // dodger blue
                Shape track = new RoundRectangle2D.Double(trackRect.x, trackRect.y + trackRect.height / 2 - 14, trackRect.width, 28, 28, 28);
                g2.fill(track);
            }

            @Override
            public void paintThumb(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                // 白色圆形滑块
                g2.setColor(Color.WHITE);
                int diameter = 24; // 更小的滑块直径，使其在蓝条内完全居中
                int thumbX = Math.max(trackRect.x, Math.min(thumbRect.x + thumbRect.width / 2 - diameter / 2, trackRect.x + trackRect.width - diameter));
                int thumbY = trackRect.y + trackRect.height / 2 - diameter / 2;
                g2.fill(new Ellipse2D.Double(thumbX, thumbY, diameter, diameter));
            }
        });
        return slider;
    }

    // 检查玩家人数与难度滑动条是否选择了有效值，决定是否启用“开始游戏”按钮
    private void checkSelections() {
        boolean ready = playerSlider.getValue() > 0 && difficultySlider.getValue() > 0;
        startButton.setEnabled(ready);
    }
}
