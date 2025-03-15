class ThemeColors:
    """主题颜色配置"""
    def __init__(self):
        # 主色调
        self.primary = "#2196F3"  # 蓝色
        self.secondary = "#757575"  # 灰色
        
        # 背景色
        self.bg_gradient_top = "#FFFFFF"  # 白色
        self.bg_gradient_bottom = "#F5F5F5"  # 浅灰色
        self.frame = "#FFFFFF"  # 白色
        
        # 文本颜色
        self.text = "#212121"  # 深灰色
        self.text_secondary = "#757575"  # 中灰色
        
        # 输入框背景
        self.input_bg = "#F5F5F5"  # 浅灰色
        
        # 状态颜色
        self.success = "#4CAF50"  # 绿色
        self.error = "#F44336"    # 红色
        self.warning = "#FFC107"  # 黄色
        self.info = "#2196F3"     # 蓝色
        
        # 文字颜色
        self.text_light = "#ffffff"  # 白色文字

class FontStyles:
    """字体样式配置"""
    def __init__(self):
        self.title = ("SF Pro Display", 28, "bold")  # 主标题
        self.subtitle = ("SF Pro Display", 14)  # 副标题
        self.heading = ("SF Pro Display", 16, "bold")  # 标题
        self.body = ("SF Pro Text", 12)  # 正文
        self.button = ("SF Pro Text", 11, "bold")  # 按钮
        self.small = ("SF Pro Text", 10)  # 小字体

class ComponentStyles:
    """组件样式配置"""
    def __init__(self, colors: ThemeColors):
        self.colors = colors
        
        # 主要按钮样式
        self.button_primary = {
            "bg": self.colors.primary,
            "fg": self.colors.text_light,
            "font": ("SF Pro Text", 11, "bold"),
            "activebackground": self._adjust_color(self.colors.primary, -20),
            "activeforeground": self.colors.text_light,
            "relief": "flat",
            "bd": 0,
            "padx": 20,
            "pady": 8,
            "cursor": "hand2",
            "highlightthickness": 0,
            "highlightbackground": self.colors.primary
        }
        
        # 次要按钮样式
        self.button_secondary = {
            "bg": self.colors.secondary,
            "fg": self.colors.text_light,
            "font": ("SF Pro Text", 11, "bold"),
            "activebackground": self._adjust_color(self.colors.secondary, -20),
            "activeforeground": self.colors.text_light,
            "relief": "flat",
            "bd": 0,
            "padx": 15,
            "pady": 6,
            "cursor": "hand2",
            "highlightthickness": 0,
            "highlightbackground": self.colors.secondary
        }
        
        # 文本按钮样式
        self.button_text = {
            "bg": self.colors.frame,
            "fg": self.colors.primary,
            "font": ("SF Pro Text", 11),
            "activebackground": self._adjust_color(self.colors.frame, -10),
            "activeforeground": self.colors.primary,
            "relief": "flat",
            "bd": 0,
            "padx": 10,
            "pady": 5,
            "cursor": "hand2",
            "highlightthickness": 0
        }
        
        # 输入框样式
        self.entry = {
            "bg": self.colors.input_bg,
            "fg": self.colors.text,
            "font": ("SF Pro Text", 12),
            "relief": "flat",
            "bd": 1,
            "highlightthickness": 1,
            "highlightcolor": self.colors.primary,
            "insertbackground": self.colors.text,
            "selectbackground": self.colors.primary,
            "selectforeground": self.colors.text_light
        }
        
        # 标签样式
        self.label = {
            "bg": self.colors.frame,
            "fg": self.colors.text,
            "font": ("SF Pro Text", 12),
            "padx": 0,
            "pady": 5
        }
        
        # 标题标签样式
        self.label_heading = {
            "bg": self.colors.frame,
            "fg": self.colors.text,
            "font": ("SF Pro Display", 14, "bold"),
            "padx": 0,
            "pady": 10
        }
        
    def _adjust_color(self, color: str, amount: int) -> str:
        """调整颜色明暗度"""
        if not color.startswith("#"):
            return color
            
        rgb = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
        rgb = tuple(max(0, min(255, c + amount)) for c in rgb)
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"

class GUIStyles:
    """GUI样式配置"""
    def __init__(self):
        self.colors = ThemeColors()
        self.fonts = FontStyles()
        self.components = ComponentStyles(self.colors)
        
        # 窗口配置
        self.window = {
            "title": "Bilibili视频下载器",
            "size": "900x700",
            "resizable": (True, True),
            "bg": self.colors.bg_gradient_top
        }
        
    def hex_to_rgb(self, hex_color: str) -> tuple:
        """将十六进制颜色转换为RGB元组"""
        hex_color = hex_color.lstrip("#")
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
    def adjust_color(self, color: str, amount: int) -> str:
        """调整颜色明暗度"""
        return self.components._adjust_color(color, amount)

    def adjust_color(self, color_hex: str, brightness_offset: int) -> str:
        """调整颜色亮度"""
        # 将十六进制颜色转换为RGB
        r = int(color_hex[1:3], 16)
        g = int(color_hex[3:5], 16)
        b = int(color_hex[5:7], 16)
        
        # 调整亮度
        r = max(0, min(255, r + brightness_offset))
        g = max(0, min(255, g + brightness_offset))
        b = max(0, min(255, b + brightness_offset))
        
        return f'#{r:02x}{g:02x}{b:02x}'
    
    def hex_to_rgb(self, hex_color: str) -> tuple:
        """将十六进制颜色转换为RGB元组"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4)) 