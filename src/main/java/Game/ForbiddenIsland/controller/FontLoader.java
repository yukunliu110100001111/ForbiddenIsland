package Game.ForbiddenIsland.controller;

import java.awt.*;
import java.io.IOException;
import java.io.InputStream;

public class FontLoader {
    public static Font loadFont(String path, float size) {
        try {
            // 从资源目录加载字体文件
            InputStream fontStream = FontLoader.class.getResourceAsStream(path);
            if (fontStream == null) {
                throw new IOException("字体文件未找到: " + path);
            }
            // 创建基础字体
            Font baseFont = Font.createFont(Font.TRUETYPE_FONT, fontStream);
            // 注册字体到图形环境（可选，但推荐）
            GraphicsEnvironment.getLocalGraphicsEnvironment().registerFont(baseFont);
            // 返回指定大小的字体
            return baseFont.deriveFont(size);
        } catch (FontFormatException | IOException e) {
            e.printStackTrace();
            // 加载失败时回退到默认字体
            return new Font("Arial", Font.PLAIN, (int) size);
        }
    }
}