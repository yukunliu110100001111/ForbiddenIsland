package Game.ForbiddenIsland.Main;

import java.awt.*;


public class Settings {
    public static int masterVolume = 80;
    public static int musicVolume = 60;
    public static int sfxVolume = 70;

    public static String resolution = "1200x900";
    public static boolean fullscreen = false;

    public static Dimension getResolutionDimension() {
        switch (resolution) {
            case "800x600":
                return new Dimension(800, 600);
            case "1024x768":
                return new Dimension(1024, 768);
            case "1280x960":
                return new Dimension(1280, 960);
            default:
                return new Dimension(1200, 900);
        }
    }

    public static void applySettingsToFrame(Frame frame) {
        if (fullscreen) {
            frame.dispose();
            frame.setUndecorated(true);
            frame.setExtendedState(Frame.MAXIMIZED_BOTH);
            frame.setVisible(true);
        } else {
            frame.dispose();
            frame.setUndecorated(false);
            frame.setSize(getResolutionDimension());
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        }

        float scale = getScaleFactor();
        updateFontSize(frame, scale);
        frame.revalidate();

    }

    private static float getScaleFactor() {
        Dimension d = getResolutionDimension();
        int baseWidth = 1200;
        return Math.max(1f, d.width / (float) baseWidth);
    }

    private static void updateFontSize(Component comp, float scale) {
        if (comp == null) return;
        Font font = comp.getFont();
        if (font != null) {
            comp.setFont(font.deriveFont(font.getSize2D() * scale));
        }
        if (comp instanceof Container) {
            for (Component child : ((Container) comp).getComponents()) {
                updateFontSize(child, scale);
            }
        }
    }

}
