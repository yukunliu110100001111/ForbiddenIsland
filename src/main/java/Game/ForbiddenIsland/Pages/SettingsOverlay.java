package Game.ForbiddenIsland.Pages;

import javax.swing.*;
import java.awt.*;

import Game.ForbiddenIsland.Main.Settings;

public class SettingsOverlay extends JPopupMenu {
    private static final long serialVersionUID = 1L;

    public SettingsOverlay() {
        setOpaque(true);
        setBackground(new Color(40, 40, 40, 240));
        setBorder(BorderFactory.createEmptyBorder());
        setPreferredSize(new Dimension(500, 380));
        setupContent();
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(getBackground());
        g2.fillRoundRect(0, 0, getWidth(), getHeight(), 30, 30);
        g2.dispose();
    }

    private void setupContent() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setOpaque(false);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 10, 8, 10);
        gbc.anchor = GridBagConstraints.WEST;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.gridy = 0;

        JSlider masterSlider = createSliderOnly(Settings.masterVolume);
        masterSlider.addChangeListener(e -> Settings.masterVolume = masterSlider.getValue());
        panel.add(createLabeledRow("Master Volume", masterSlider), gbc);

        gbc.gridy++;
        JSlider musicSlider = createSliderOnly(Settings.musicVolume);
        musicSlider.addChangeListener(e -> Settings.musicVolume = musicSlider.getValue());
        panel.add(createLabeledRow("Music Volume", musicSlider), gbc);

        gbc.gridy++;
        JSlider sfxSlider = createSliderOnly(Settings.sfxVolume);
        sfxSlider.addChangeListener(e -> Settings.sfxVolume = sfxSlider.getValue());
        panel.add(createLabeledRow("Sound Effects", sfxSlider), gbc);

        gbc.gridy++;
        JComboBox<String> resolutionBox = new JComboBox<>(new DefaultComboBoxModel<>(new String[]{"800 x 600", "1024 x 768", "1280 x 960", "1200 x 900"})) {
            @Override
            public void setPopupVisible(boolean v) {
                if (v || isPopupVisible()) super.setPopupVisible(v);
            }
        };
        resolutionBox.setFont(new Font("SansSerif", Font.PLAIN, 14));
        resolutionBox.setBackground(new Color(60, 60, 60));
        resolutionBox.setForeground(Color.WHITE);
        resolutionBox.setFocusable(false);
        resolutionBox.setUI(new javax.swing.plaf.basic.BasicComboBoxUI() {
            @Override
            protected JButton createArrowButton() {
                JButton button = new JButton("▼");
                button.setFont(new Font("SansSerif", Font.BOLD, 10));
                button.setForeground(Color.WHITE);
                button.setBackground(new Color(60, 60, 60));
                return button;
            }
        });
        resolutionBox.setSelectedItem(Settings.resolution.replace("x", " x "));
        resolutionBox.addActionListener(e -> SwingUtilities.invokeLater(() -> {
            String selected = (String) resolutionBox.getSelectedItem();
            if (selected != null) {
                Settings.resolution = selected.replace(" ", "");
            }
        }));
        panel.add(createLabeledRow("Resolution", resolutionBox), gbc);

        gbc.gridy++;
        JCheckBox fullscreenBox = new JCheckBox("Fullscreen Mode");
        fullscreenBox.setForeground(Color.WHITE);
        fullscreenBox.setOpaque(false);
        fullscreenBox.setFocusable(false);
        fullscreenBox.setSelected(Settings.fullscreen);
        fullscreenBox.addActionListener(e -> Settings.fullscreen = fullscreenBox.isSelected());
        panel.add(createLabeledRow("", fullscreenBox), gbc);

        gbc.gridy++;
        JButton testSoundButton = new JButton("🔊 Test Sound");
        testSoundButton.setFont(new Font("SansSerif", Font.BOLD, 14));
        testSoundButton.setBackground(Color.DARK_GRAY);
        testSoundButton.setForeground(Color.WHITE);
        testSoundButton.setFocusable(false);
        testSoundButton.addActionListener(e -> Toolkit.getDefaultToolkit().beep());
        panel.add(createLabeledRow("", testSoundButton), gbc);

        gbc.gridy++;
        JButton applyButton = new JButton("✔ Apply Settings");
        applyButton.setFont(new Font("SansSerif", Font.BOLD, 15));
        applyButton.setBackground(Color.WHITE);
        applyButton.setForeground(Color.BLACK);
        applyButton.setFocusable(false);
        applyButton.addActionListener(e -> {
            Window window = SwingUtilities.getWindowAncestor(this);
            if (window instanceof Frame) {
                Settings.applySettingsToFrame((Frame) window);
            }
            setVisible(false);
        });
        JPanel buttonWrapper = new JPanel(new FlowLayout(FlowLayout.CENTER));
        buttonWrapper.setOpaque(false);
        buttonWrapper.add(applyButton);
        panel.add(buttonWrapper, gbc);

        add(panel);
        panel.setPreferredSize(new Dimension(540, 420));
    }

    private JPanel createLabeledRow(String label, JComponent component) {
        JPanel row = new JPanel(new BorderLayout());
        row.setOpaque(false);
        JLabel l = new JLabel(label);
        l.setFont(new Font("SansSerif", Font.BOLD, 16));
        l.setForeground(Color.WHITE);
        l.setPreferredSize(new Dimension(120, 20));
        row.add(l, BorderLayout.WEST);
        row.add(component, BorderLayout.CENTER);
        return row;
    }

    private JSlider createSliderOnly(int initial) {
        JSlider slider = new JSlider(0, 100, initial);
        slider.setUI(new javax.swing.plaf.basic.BasicSliderUI(slider) {
            @Override
            public void paintTrack(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setPaint(Color.DARK_GRAY);
                g2.fillRoundRect(trackRect.x, trackRect.y + trackRect.height / 2 - 5, trackRect.width, 10, 10, 10);
            }

            @Override
            public void paintThumb(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(Color.WHITE);
                int diameter = 14;
                int x = thumbRect.x + thumbRect.width / 2 - diameter / 2;
                int y = trackRect.y + trackRect.height / 2 - diameter / 2;
                g2.fillOval(x, y, diameter, diameter);
            }
        });
        slider.setOpaque(false);
        slider.setFocusable(false);
        slider.setForeground(Color.WHITE);
        return slider;
    }

    public void showSettings(Component invoker, int x, int y) {
        show(invoker, x, y);
    }
}
