import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
import sys
import subprocess
import threading
import re
from typing import Dict, List
import time
import random
import string

# 添加调试模式标志（True 表示不需要验证激活）
DEBUG_MODE = True

# 添加父目录到系统路径
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from utils.bilibili import BilibiliDownloader
from utils.gui_styles import GUIStyles
from utils.security import SecurityManager

def get_application_path():
    """获取应用程序路径，支持普通运行和打包后运行"""
    if getattr(sys, 'frozen', False):
        # 如果是打包后的应用程序
        application_path = os.path.dirname(sys.executable)
    else:
        # 如果是直接运行的 Python 脚本
        application_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 创建并返回下载目录路径
    downloads_path = os.path.join(application_path, 'downloads')
    if not os.path.exists(downloads_path):
        os.makedirs(downloads_path)
    return downloads_path

class ModernButton(tk.Button):
    """现代风格按钮"""
    def __init__(self, master, styles: GUIStyles, is_primary=True, **kwargs):
        self.styles = styles
        
        # 选择按钮样式
        button_style = (styles.components.button_primary if is_primary 
                       else styles.components.button_secondary).copy()
        
        # 合并自定义样式
        button_style.update(kwargs)
        
        # 确保基本样式存在
        button_style.update({
            'relief': 'flat',
            'bd': 0,
            'highlightthickness': 0,
            'padx': 20,
            'pady': 8,
        })
        
        super().__init__(master, **button_style)

class LoadingSpinner(tk.Canvas):
    """加载动画组件"""
    def __init__(self, master, styles: GUIStyles, size=30, **kwargs):
        super().__init__(master, width=size, height=size, **kwargs)
        self.size = size
        self._angle = 0
        self._running = False
        
        # 创建圆弧
        self.arc = self.create_arc(5, 5, size-5, size-5, 
                                 start=0, extent=30,
                                 width=3)
        
    def start(self):
        """开始动画"""
        self._running = True
        self._animate()
        
    def stop(self):
        """停止动画"""
        self._running = False
        
    def _animate(self):
        """更新动画"""
        if self._running:
            self._angle = (self._angle + 10) % 360
            self.delete(self.arc)
            self.arc = self.create_arc(5, 5, self.size-5, self.size-5,
                                     start=self._angle,
                                     extent=30,
                                     width=3)
            self.after(50, self._animate)

class BilibiliDownloaderGUI:
    def __init__(self, root):
        self.root = root
        self.styles = GUIStyles()
        self.security = SecurityManager()
        
        # 在调试模式下默认设置为已激活
        self.is_activated = DEBUG_MODE
        self.activation_code = "已激活" if DEBUG_MODE else ""
        
        # 获取屏幕尺寸
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        
        # 计算窗口大小（使用屏幕的80%）
        window_width = int(screen_width * 0.8)
        window_height = int(screen_height * 0.8)
        
        # 计算窗口位置（居中）
        x = (screen_width - window_width) // 2
        y = (screen_height - window_height) // 2
        
        # 配置主窗口
        self.root.title(self.styles.window['title'])
        self.root.geometry(f"{window_width}x{window_height}+{x}+{y}")
        self.root.resizable(*self.styles.window['resizable'])
        self.root.configure(bg=self.styles.window['bg'])
        
        # 初始化下载器
        self.downloader = BilibiliDownloader()
        self.download_path = get_application_path()
        self.downloader.download_base_path = self.download_path
        
        # 存储播放列表信息
        self.playlist_info = None
        self.selected_videos = []
        
        # 先创建界面
        self._create_widgets()
        
        # 然后检查激活状态
        self.check_activation()
        
    def _create_widgets(self):
        # 创建主滚动区域
        self.main_scroll = tk.Canvas(
            self.root,
            bg=self.styles.colors.bg_gradient_top,
            highlightthickness=0
        )
        self.main_scroll.pack(side='left', fill='both', expand=True)
        
        # 添加垂直滚动条
        main_scrollbar = ttk.Scrollbar(
            self.root,
            orient='vertical',
            command=self.main_scroll.yview,
            style="Custom.Vertical.TScrollbar"
        )
        main_scrollbar.pack(side='right', fill='y')
        
        # 配置画布
        self.main_scroll.configure(yscrollcommand=main_scrollbar.set)
        
        # 创建内容框架
        self.content_frame = tk.Frame(self.main_scroll, bg=self.styles.colors.bg_gradient_top)
        self.main_scroll.create_window((0, 0), window=self.content_frame, anchor='nw', tags='content')
        
        # 主容器
        container = tk.Frame(self.content_frame, bg=self.styles.colors.bg_gradient_top)
        container.pack(padx=40, pady=40, fill='both', expand=True)
        
        # 标题区域
        self._create_title_section(container)
        
        # URL输入区域
        self._create_url_section(container)
        
        # 播放列表信息区域
        self._create_playlist_section(container)
        
        # 下载控制区域
        self._create_download_section(container)
        
        # 日志区域
        self._create_log_section(container)
        
        # 绑定事件以更新滚动区域
        def _configure_scroll_region(event=None):
            self.main_scroll.configure(scrollregion=self.main_scroll.bbox('all'))
            # 设置内容框架的宽度与画布相同
            self.main_scroll.itemconfig('content', width=self.main_scroll.winfo_width())
        
        self.content_frame.bind('<Configure>', _configure_scroll_region)
        self.main_scroll.bind('<Configure>', _configure_scroll_region)
        
        # 优化的鼠标滚轮事件处理
        def _on_mousewheel(event):
            # 获取当前鼠标位置
            widget = event.widget
            x, y = widget.winfo_rootx(), widget.winfo_rooty()
            win_x, win_y = event.x_root, event.y_root
            
            # 检查鼠标是否在视频列表区域
            if hasattr(self, 'video_listbox'):
                listbox_x = self.video_listbox.winfo_rootx()
                listbox_y = self.video_listbox.winfo_rooty()
                listbox_width = self.video_listbox.winfo_width()
                listbox_height = self.video_listbox.winfo_height()
                
                # 如果鼠标在视频列表区域内，不处理主滚动
                if (listbox_x <= win_x <= listbox_x + listbox_width and 
                    listbox_y <= win_y <= listbox_y + listbox_height):
                    return
                    
            # 平滑滚动
            delta = -1 if event.delta < 0 else 1
            self.main_scroll.yview_scroll(delta, "units")
        
        # 解绑之前的滚轮事件
        self.main_scroll.unbind_all('<MouseWheel>')
        # 绑定新的滚轮事件
        self.root.bind('<MouseWheel>', _on_mousewheel)
        
        # 设置初始滚动区域
        self.main_scroll.update_idletasks()
        _configure_scroll_region()
        
    def _create_title_section(self, container):
        """创建标题区域"""
        title_frame = tk.Frame(container, bg=self.styles.colors.bg_gradient_top)
        title_frame.pack(fill='x', pady=(0, 30))
        
        title = tk.Label(
            title_frame,
            text="Bilibili视频下载器",
            font=('Arial', 14, 'bold'),
            fg=self.styles.colors.primary,
            bg=self.styles.colors.bg_gradient_top
        )
        title.pack()
        
        subtitle = tk.Label(
            title_frame,
            text="轻松下载B站视频和播放列表",
            font=('Arial', 14),
            fg=self.styles.colors.text_secondary,
            bg=self.styles.colors.bg_gradient_top
        )
        subtitle.pack()
        
    def _create_url_section(self, container):
        """创建URL输入区域"""
        url_frame = tk.Frame(
            container,
            bg=self.styles.colors.frame,
            bd=0,
            highlightthickness=1,
            highlightbackground=self.styles.colors.primary,
            highlightcolor=self.styles.colors.primary
        )
        url_frame.pack(fill='x', pady=(0, 20))
        
        # URL输入框
        url_inner = tk.Frame(url_frame, bg=self.styles.colors.frame, padx=20, pady=20)
        url_inner.pack(fill='x')
        
        # 激活码输入区域（在非调试模式下显示）
        if not DEBUG_MODE:
            activation_frame = tk.Frame(url_inner, bg=self.styles.colors.frame)
            activation_frame.pack(fill='x', pady=(0, 15))
            
            tk.Label(
                activation_frame,
                text="激活码:",
                font=self.styles.fonts.body,
                fg=self.styles.colors.text,
                bg=self.styles.colors.frame
            ).pack(side='left')
            
            self.activation_entry = tk.Entry(
                activation_frame,
                **self.styles.components.entry,
                width=40
            )
            self.activation_entry.pack(side='left', padx=(10, 10))
            
            self.activate_btn = ModernButton(
                activation_frame,
                self.styles,
                is_primary=True,
                text="验证激活码",
                command=self._validate_activation_code
            )
            self.activate_btn.pack(side='left')
            
            self.activation_status = tk.Label(
                activation_frame,
                text="",
                font=self.styles.fonts.body,
                fg=self.styles.colors.text,
                bg=self.styles.colors.frame
            )
            self.activation_status.pack(side='left', padx=(10, 0))
        
        # URL输入区域
        url_input_frame = tk.Frame(url_inner, bg=self.styles.colors.frame)
        url_input_frame.pack(fill='x', pady=(0, 15))
        
        tk.Label(
            url_input_frame,
            text="视频/播放列表URL:",
            font=self.styles.fonts.body,
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(anchor='w')
        
        self.url_entry = tk.Entry(
            url_input_frame,
            **self.styles.components.entry
        )
        self.url_entry.pack(fill='x', pady=(10, 0))
        
        # 下载路径选择区域
        path_frame = tk.Frame(url_inner, bg=self.styles.colors.frame)
        path_frame.pack(fill='x', pady=(0, 15))
        
        tk.Label(
            path_frame,
            text="下载路径:",
            font=self.styles.fonts.body,
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(anchor='w')
        
        path_select_frame = tk.Frame(path_frame, bg=self.styles.colors.frame)
        path_select_frame.pack(fill='x', pady=(10, 0))
        
        self.path_var = tk.StringVar(value=self.download_path)
        path_entry = tk.Entry(
            path_select_frame,
            textvariable=self.path_var,
            **self.styles.components.entry
        )
        path_entry.pack(side='left', fill='x', expand=True)
        
        # 选择路径按钮
        choose_path_btn = ModernButton(
            path_select_frame,
            self.styles,
            is_primary=False,
            text="选择路径",
            command=self._choose_path
        )
        choose_path_btn.pack(side='left', padx=(10, 0))
        
        # 按钮区域使用单独的框架
        button_frame = tk.Frame(url_inner, bg=self.styles.colors.frame)
        button_frame.pack(fill='x')
        
        # 获取视频信息按钮
        validate_btn = ModernButton(
            button_frame,
            self.styles,
            is_primary=True,
            text="获取视频信息",
            command=self._validate_and_get_info
        )
        validate_btn.pack()
        
    def _create_playlist_section(self, container):
        """创建播放列表信息显示区域"""
        self.playlist_frame = tk.Frame(
            container,
            bg=self.styles.colors.frame,
            bd=0,
            highlightthickness=1,
            highlightbackground=self.styles.colors.primary,
            highlightcolor=self.styles.colors.primary
        )
        self.playlist_frame.pack(fill='both', expand=True, pady=(0, 20))
        
        # 初始状态隐藏
        self.playlist_frame.pack_forget()
        
    def _create_download_section(self, container):
        """创建下载控制区域"""
        download_frame = tk.Frame(container, bg=self.styles.colors.bg_gradient_top)
        download_frame.pack(fill='x', pady=(0, 20))
        
        # 左侧按钮组
        left_buttons = tk.Frame(download_frame, bg=self.styles.colors.bg_gradient_top)
        left_buttons.pack(side='left')
        
        # 下载按钮
        self.download_btn = ModernButton(
            left_buttons,
            self.styles,
            is_primary=True,
            text="下载选中视频",
            command=self._download_selected
        )
        self.download_btn.pack(side='left', padx=5)
        
        # 打开文件夹按钮
        open_folder_btn = ModernButton(
            left_buttons,
            self.styles,
            is_primary=False,
            text="打开下载文件夹",
            command=self._open_download_folder
        )
        open_folder_btn.pack(side='left', padx=5)
        
        # 右侧加载动画
        right_frame = tk.Frame(download_frame, bg=self.styles.colors.bg_gradient_top)
        right_frame.pack(side='right')
        
        self.loading_spinner = LoadingSpinner(
            right_frame,
            self.styles,
            size=30
        )
        
    def _create_log_section(self, container):
        """创建日志显示区域"""
        log_frame = tk.Frame(
            container,
            bg=self.styles.colors.frame,
            bd=0,
            highlightthickness=1,
            highlightbackground=self.styles.colors.primary,
            highlightcolor=self.styles.colors.primary
        )
        log_frame.pack(fill='both', expand=True)
        
        # 日志标题
        tk.Label(
            log_frame,
            text="下载日志",
            font=('Arial', 12, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame,
            padx=20,
            pady=10
        ).pack(anchor='w')
        
        # 创建一个固定最小高度的容器
        log_container = tk.Frame(log_frame, bg=self.styles.colors.frame, height=300)
        log_container.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        log_container.pack_propagate(False)  # 防止高度被内容撑开
        
        # 日志文本框
        self.log_text = tk.Text(
            log_container,
            font=('Arial', 11),
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text,
            insertbackground=self.styles.colors.text,
            relief='flat',
            padx=10,
            pady=10
        )
        self.log_text.pack(fill='both', expand=True)
        
        # 自定义滚动条样式
        style = ttk.Style()
        style.configure(
            "Custom.Vertical.TScrollbar",
            troughcolor=self.styles.colors.input_bg,
            background=self.styles.colors.primary,
            arrowcolor=self.styles.colors.text,
            bordercolor=self.styles.colors.primary,
            lightcolor=self.styles.colors.primary,
            darkcolor=self.styles.colors.primary
        )
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(
            self.log_text,
            orient='vertical',
            command=self.log_text.yview,
            style="Custom.Vertical.TScrollbar"
        )
        scrollbar.pack(side='right', fill='y')
        self.log_text.configure(yscrollcommand=scrollbar.set)
        
        # 初始日志
        self._log("程序已启动，请输入视频URL...")
        self._log(f"下载文件将保存到: {self.download_path}")
        
    def _validate_and_get_info(self):
        """验证URL并获取信息"""
        url = self.url_entry.get().strip()
        if not self._validate_url(url):
            return
            
        # 显示加载动画
        self.loading_spinner.pack(side='left', padx=10)
        self.loading_spinner.start()
        
        def fetch_info():
            try:
                info = self.downloader.get_playlist_info(url)
                if info['success']:
                    self.playlist_info = info
                    self.root.after(0, self._update_playlist_display)
                else:
                    self._log(f"获取信息失败: {info['error']}")
            except Exception as e:
                self._log(f"获取信息失败: {str(e)}")
            finally:
                self.root.after(0, self._stop_loading)
                
        threading.Thread(target=fetch_info, daemon=True).start()
        
    def _stop_loading(self):
        """停止加载动画"""
        self.loading_spinner.stop()
        self.loading_spinner.pack_forget()
        
    def _update_playlist_display(self):
        """更新播放列表显示"""
        # 清空现有内容
        for widget in self.playlist_frame.winfo_children():
            widget.destroy()
            
        # 显示播放列表框架
        self.playlist_frame.pack(fill='both', expand=True, pady=(0, 20))
        
        # 创建播放列表信息头部
        header = tk.Frame(self.playlist_frame, bg=self.styles.colors.frame, padx=20, pady=10)
        header.pack(fill='x')
        
        # 播放列表标题和视频计数
        title_frame = tk.Frame(header, bg=self.styles.colors.frame)
        title_frame.pack(fill='x')
        
        tk.Label(
            title_frame,
            text=f"播放列表: {self.playlist_info['playlist_title']}",
            font=('Arial', 14, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(side='left')
        
        self.video_count_label = tk.Label(
            title_frame,
            text=f"(共 {self.playlist_info['video_count']} 个视频)",
            font=('Arial', 12),
            fg=self.styles.colors.text_secondary,
            bg=self.styles.colors.frame
        )
        self.video_count_label.pack(side='left', padx=(10, 0))
        
        # 搜索框
        search_frame = tk.Frame(header, bg=self.styles.colors.frame)
        search_frame.pack(fill='x', pady=(10, 0))
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', lambda *args: self._filter_videos())
        
        search_entry = tk.Entry(
            search_frame,
            textvariable=self.search_var,
            font=('Arial', 11),
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text,
            insertbackground=self.styles.colors.text,
            relief='flat',
            bd=1,
            highlightthickness=1,
            highlightbackground=self.styles.colors.primary,
            highlightcolor=self.styles.colors.primary
        )
        search_entry.pack(fill='x')

        # 创建日志区域（移到视频列表上方）
        log_section = tk.Frame(self.playlist_frame, bg=self.styles.colors.frame, padx=20, pady=10)
        log_section.pack(fill='both', expand=True)
        
        # 日志标题
        tk.Label(
            log_section,
            text="下载日志",
            font=('Arial', 12, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(anchor='w')
        
        # 创建一个固定最小高度的日志容器
        log_container = tk.Frame(log_section, bg=self.styles.colors.frame, height=200)
        log_container.pack(fill='both', expand=True)
        log_container.pack_propagate(False)  # 防止高度被内容撑开
        
        # 日志文本框
        self.log_text = tk.Text(
            log_container,
            font=('Arial', 11),
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text,
            insertbackground=self.styles.colors.text,
            relief='flat',
            padx=10,
            pady=10
        )
        self.log_text.pack(fill='both', expand=True)
        
        # 日志滚动条
        log_scrollbar = ttk.Scrollbar(
            log_container,
            orient='vertical',
            command=self.log_text.yview,
            style="Custom.Vertical.TScrollbar"
        )
        log_scrollbar.pack(side='right', fill='y')
        self.log_text.configure(yscrollcommand=log_scrollbar.set)
        
        # 创建视频列表区域
        list_frame = tk.Frame(self.playlist_frame, bg=self.styles.colors.frame, padx=20, pady=10)
        list_frame.pack(fill='both', expand=True)
        
        # 控制按钮
        control_frame = tk.Frame(list_frame, bg=self.styles.colors.frame)
        control_frame.pack(fill='x', pady=(0, 10))
        
        # 全选按钮
        self.select_all_var = tk.BooleanVar()
        select_all_cb = tk.Checkbutton(
            control_frame,
            text="全选",
            variable=self.select_all_var,
            command=self._toggle_select_all,
            bg=self.styles.colors.frame,
            fg=self.styles.colors.text,
            selectcolor=self.styles.colors.primary,
            activebackground=self.styles.colors.frame,
            activeforeground=self.styles.colors.text
        )
        select_all_cb.pack(side='left')
        
        # 创建列表框和滚动条（固定高度）
        list_container = tk.Frame(list_frame, bg=self.styles.colors.frame, height=300)
        list_container.pack(fill='both', expand=True)
        list_container.pack_propagate(False)  # 防止高度被内容撑开
        
        self.video_listbox = tk.Listbox(
            list_container,
            bg=self.styles.colors.input_bg,
            fg=self.styles.colors.text,
            selectmode='multiple',
            font=('Arial', 11),
            relief='flat',
            bd=1,
            highlightthickness=1,
            highlightbackground=self.styles.colors.primary,
            highlightcolor=self.styles.colors.primary
        )
        self.video_listbox.pack(side='left', fill='both', expand=True)
        
        # 视频列表的滚动条
        video_scrollbar = ttk.Scrollbar(
            list_container,
            orient='vertical',
            command=self.video_listbox.yview,
            style="Custom.Vertical.TScrollbar"
        )
        video_scrollbar.pack(side='right', fill='y')
        self.video_listbox.configure(yscrollcommand=video_scrollbar.set)
        
        # 绑定视频列表的鼠标滚轮事件
        def _on_listbox_mousewheel(event):
            self.video_listbox.yview_scroll(int(-1 * (event.delta / 120)), "units")
            return "break"  # 阻止事件继续传播
            
        self.video_listbox.bind('<MouseWheel>', _on_listbox_mousewheel)
        
        # 显示视频列表
        self._filter_videos()

    def _filter_videos(self):
        """根据搜索关键词筛选视频"""
        # 清空列表
        self.video_listbox.delete(0, tk.END)
        
        # 获取搜索关键词
        search_text = self.search_var.get().lower().strip()
        
        # 初始化视频映射字典
        self.video_map = {}
        
        # 筛选并显示视频
        filtered_videos = []
        for video in self.playlist_info['videos']:
            if not search_text or search_text in video['title'].lower():
                filtered_videos.append(video)
                # 创建显示标题
                display_title = f"{video['title']} ({time.strftime('%H:%M:%S', time.gmtime(video['duration']))})"
                # 保存URL映射
                self.video_map[display_title] = video['url']
                # 添加到列表框
                self.video_listbox.insert(tk.END, display_title)
                
        # 更新计数
        total = self.playlist_info['video_count']
        filtered = len(filtered_videos)
        if filtered == total:
            self.video_count_label.configure(text=f"(共 {total} 个视频)")
        else:
            self.video_count_label.configure(text=f"(显示 {filtered}/{total} 个视频)")

    def _toggle_select_all(self):
        """切换全选状态"""
        if self.select_all_var.get():
            self.video_listbox.select_set(0, tk.END)
        else:
            self.video_listbox.selection_clear(0, tk.END)

    def _validate_activation_code(self):
        """验证激活码"""
        code = self.activation_entry.get().strip()
        if not code:
            self.activation_status.config(
                text="请输入激活码",
                fg=self.styles.colors.error
            )
            return
            
        is_valid, message = self.security.validate_activation_code(code)
        if is_valid:
            self.activation_code = code
            self.is_activated = True
            self.activation_status.config(
                text=message,
                fg=self.styles.colors.success
            )
            self.activation_entry.config(state='disabled')
            self.activate_btn.config(state='disabled')
            self._log(f"激活成功: {message}")
            
            # 保存激活状态
            self.security._save_activation_info({
                'machine_id': self.security._generate_machine_id(),
                'created_at': int(time.time()),
                'expires_at': int(time.time() + 6 * 24 * 60 * 60),  # 6天
                'salt': ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            })
        else:
            self.activation_status.config(
                text=message,
                fg=self.styles.colors.error
            )
            self.is_activated = False

    def _download_selected(self):
        """下载选中的视频"""
        # 检查激活状态（在非调试模式下）
        if not DEBUG_MODE and not self.check_saved_activation():
            messagebox.showerror("错误", "请先激活程序")
            return
            
        # 获取选中的索引
        selected_indices = self.video_listbox.curselection()
        if not selected_indices:
            messagebox.showwarning("提示", "请先选择要下载的视频")
            return
            
        # 获取选中的视频信息
        selected_videos = []
        for index in selected_indices:
            video_info = self.playlist_info['videos'][int(index)]
            # 清理文件名中的特殊字符
            clean_title = re.sub(r'[\\/:*?"<>|]', '_', video_info['title'])
            selected_videos.append((video_info['url'], clean_title))
            
        # 显示加载动画
        self.loading_spinner.pack(side='left', padx=10)
        self.loading_spinner.start()
        
        def download_thread():
            try:
                total = len(selected_videos)
                self._log(f"开始下载 {total} 个视频...")
                for i, (url, title) in enumerate(selected_videos, 1):
                    try:
                        self._log(f"[{i}/{total}] 开始下载: {title}")
                        self.downloader.download_video(url, title)
                        self._log(f"[{i}/{total}] 下载完成: {title}")
                    except Exception as e:
                        self._log(f"[{i}/{total}] 下载失败: {title}\n错误: {str(e)}")
                
                self._log("\n所有下载任务已完成！")
                
                # 询问是否打开文件夹
                if messagebox.askyesno("下载完成", "视频下载完成，是否打开下载文件夹？"):
                    self._open_download_folder()
            except Exception as e:
                self._log(f"下载过程中发生错误: {str(e)}")
            finally:
                self.root.after(0, self._stop_loading)
                
        threading.Thread(target=download_thread, daemon=True).start()
        
    def _log(self, message: str):
        """添加日志"""
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        
    def _validate_url(self, url: str) -> bool:
        """验证URL"""
        if not url:
            messagebox.showerror("错误", "请输入URL")
            return False
            
        if not (url.startswith("http://") or url.startswith("https://")):
            messagebox.showerror("错误", "请输入有效的URL")
            return False
            
        if not re.search(r'space.bilibili.com/\d+/lists/\d+', url):
            messagebox.showerror("错误", "请输入有效的播放列表URL")
            return False
            
        return True
        
    def _open_download_folder(self):
        """打开下载文件夹"""
        if not os.path.exists(self.download_path):
            os.makedirs(self.download_path)
            
        if sys.platform == 'darwin':  # macOS
            subprocess.run(['open', self.download_path])
        elif sys.platform == 'win32':  # Windows
            os.startfile(self.download_path)
        else:  # Linux
            subprocess.run(['xdg-open', self.download_path])

    def _choose_path(self):
        """选择下载路径"""
        new_path = filedialog.askdirectory(
            title="选择下载路径",
            initialdir=self.download_path
        )
        if new_path:
            self.download_path = new_path
            self.downloader.download_base_path = new_path
            self.path_var.set(new_path)
            self._log(f"下载路径已更改为: {new_path}")

    def check_saved_activation(self):
        """检查已保存的激活状态"""
        if DEBUG_MODE:
            return True
            
        is_activated, message = self.security.check_activation()
        if is_activated:
            self.is_activated = True
            self.activation_code = "已激活"
            # 更新激活状态显示
            if hasattr(self, 'activation_entry'):
                self.activation_entry.delete(0, tk.END)
                self.activation_entry.insert(0, "已激活")
                self.activation_entry.config(state='disabled')
            if hasattr(self, 'activate_btn'):
                self.activate_btn.config(state='disabled')
            if hasattr(self, 'activation_status'):
                self.activation_status.config(
                    text=message,
                    fg=self.styles.colors.success
                )
            self._log(f"程序已激活: {message}")
            return True
        else:
            # 如果未激活，重置状态
            self.is_activated = False
            if hasattr(self, 'activation_entry'):
                self.activation_entry.config(state='normal')
                self.activation_entry.delete(0, tk.END)
            if hasattr(self, 'activate_btn'):
                self.activate_btn.config(state='normal')
            if hasattr(self, 'activation_status'):
                self.activation_status.config(
                    text=message,
                    fg=self.styles.colors.error
                )
            self._log(f"程序未激活: {message}")
            return False

    def check_activation(self):
        """检查激活状态"""
        if DEBUG_MODE:
            return True
            
        if self.check_saved_activation():
            return True
            
        # 如果没有激活，显示激活窗口
        self.show_activation_window()
        return False

    def show_activation_window(self):
        """显示激活窗口"""
        activation_window = tk.Toplevel(self.root)
        activation_window.title("程序激活")
        activation_window.geometry("400x200")
        activation_window.transient(self.root)  # 设置为主窗口的子窗口
        
        # 创建激活界面
        frame = tk.Frame(activation_window, bg=self.styles.colors.frame, padx=20, pady=20)
        frame.pack(fill='both', expand=True)
        
        # 提示文本
        tk.Label(
            frame,
            text="请输入激活码以继续使用",
            font=('Arial', 12, 'bold'),
            fg=self.styles.colors.text,
            bg=self.styles.colors.frame
        ).pack(pady=(0, 20))
        
        # 激活码输入框
        activation_entry = tk.Entry(
            frame,
            font=('Courier', 10),
            width=40,
            **self.styles.components.entry
        )
        activation_entry.pack(pady=(0, 10))
        
        # 激活按钮
        def validate():
            code = activation_entry.get().strip()
            if not code:
                messagebox.showerror("错误", "请输入激活码")
                return
                
            is_valid, message = self.security.validate_activation_code(code)
            if is_valid:
                self.is_activated = True
                self._log(f"激活成功: {message}")
                activation_window.destroy()
            else:
                messagebox.showerror("错误", message)
        
        tk.Button(
            frame,
            text="激活",
            command=validate,
            bg=self.styles.colors.primary,
            fg='white',
            font=('Arial', 11),
            relief='flat',
            padx=30,
            pady=5
        ).pack()
        
        # 使窗口模态，阻止与主窗口的交互
        activation_window.grab_set()
        activation_window.focus_set()
        
        # 等待窗口关闭
        self.root.wait_window(activation_window)
        
        # 如果还未激活，退出程序
        if not self.is_activated:
            self.root.quit()
            sys.exit()

    def download_selected_videos(self):
        """下载选中的视频"""
        try:
            # 再次检查激活状态
            if not self.check_activation():
                return
                
            selected_items = self.video_listbox.curselection()
            if not selected_items:
                messagebox.showwarning("提示", "请先选择要下载的视频")
                return
                
            # 获取选中的视频信息
            selected_videos = []
            for index in selected_items:
                video_info = self.playlist_info['videos'][int(index)]
                selected_videos.append({
                    'url': video_info['url'],
                    'title': video_info['title']
                })
            
            # 显示下载进度窗口
            progress_window = tk.Toplevel(self.root)
            progress_window.title("下载进度")
            progress_window.geometry("400x300")
            
            # 创建进度显示
            progress_text = tk.Text(progress_window, height=15)
            progress_text.pack(fill='both', expand=True, padx=10, pady=10)
            
            def update_progress(message):
                progress_text.insert('end', message + '\n')
                progress_text.see('end')
                progress_window.update()
            
            # 开始下载
            total = len(selected_videos)
            for i, video in enumerate(selected_videos, 1):
                try:
                    update_progress(f"[{i}/{total}] 开始下载: {video['title']}")
                    self.downloader.download_video(video['url'], video['title'])
                    update_progress(f"[{i}/{total}] 下载完成: {video['title']}\n")
                except Exception as e:
                    update_progress(f"[{i}/{total}] 下载失败: {video['title']}\n错误: {str(e)}\n")
            
            update_progress("\n所有下载任务已完成！")
            
        except Exception as e:
            messagebox.showerror("错误", f"下载过程中发生错误：{str(e)}")
            
    def _on_download_click(self):
        """下载按钮点击事件"""
        try:
            # 检查激活状态
            if not self.check_activation():
                return
                
            # 检查是否有选中的视频
            if not hasattr(self, 'playlist_info') or not self.playlist_info:
                messagebox.showwarning("提示", "请先获取视频列表")
                return
                
            self.download_selected_videos()
            
        except Exception as e:
            messagebox.showerror("错误", f"下载失败：{str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = BilibiliDownloaderGUI(root)
    root.mainloop() 