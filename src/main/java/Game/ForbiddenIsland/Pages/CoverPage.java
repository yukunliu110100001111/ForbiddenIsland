package Game.ForbiddenIsland.Pages;

import src.main.resources.Font.FontLoader;
import Game.ForbiddenIsland.Main.MainFrame;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;

public class CoverPage extends JPanel {
    private MainFrame mainFrame;
    private BufferedImage backgroundImage;
    private JPanel titlePanel;
    private JLabel enterButton;
    private Timer blinkTimer;
    private boolean visible = true;

    public CoverPage(MainFrame frame) {
        this.mainFrame = frame;
        loadBackgroundImage();
        setupUI();
        startBlinkEffect();
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
    }

    private void setupUI() {
        setLayout(new GridBagLayout());
        setOpaque(false);

        titlePanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
            }
        };
        titlePanel.setLayout(new GridBagLayout());
        titlePanel.setOpaque(false);

        Font customFont = FontLoader.loadFont("/Font/JollyLodger-Regular.ttf", 120f);

        JLabel title = new JLabel("FORBIDDEN ISLAND") {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g.create();
                GradientPaint gp = new GradientPaint(0, 0, Color.YELLOW, getWidth(), getHeight(), Color.RED);
                g2d.setPaint(gp);
                g2d.setFont(getFont());
                FontMetrics fm = g2d.getFontMetrics();
                int x = (getWidth() - fm.stringWidth(getText())) / 2;
                int y = getHeight() - fm.getDescent();
                g2d.drawString(getText(), x, y);
                g2d.dispose();
            }
        };
        title.setFont(customFont);
        title.setOpaque(false);

        titlePanel.add(title);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.weightx = 1.0;
        gbc.weighty = 1.0;
        gbc.fill = GridBagConstraints.BOTH;
        add(titlePanel, gbc);

        enterButton = new JLabel("PRESS TO START") {
            @Override
            protected void paintComponent(Graphics g) {
                if (visible) {
                    super.paintComponent(g);
                }
            }
        };
        enterButton.setFont(new Font("Arial", Font.BOLD, 36));
        enterButton.setForeground(Color.WHITE);
        enterButton.setCursor(new Cursor(Cursor.HAND_CURSOR));
        enterButton.setOpaque(false);
        enterButton.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                mainFrame.switchToPage(MainFrame.MENU_PAGE);
            }
        });

        JPanel buttonPanel = new JPanel();
        buttonPanel.setOpaque(false);
        buttonPanel.add(enterButton);

        GridBagConstraints gbcButton = new GridBagConstraints();
        gbcButton.gridx = 0;
        gbcButton.gridy = 1;
        gbcButton.insets = new Insets(0, 0, 50, 0);
        gbcButton.anchor = GridBagConstraints.SOUTH;
        add(buttonPanel, gbcButton);
    }

    private void startBlinkEffect() {
        blinkTimer = new Timer(500, e -> {
            visible = !visible;
            enterButton.repaint();
        });
        blinkTimer.start();
    }
}