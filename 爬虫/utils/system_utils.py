import os
import sys
import subprocess
from typing import Optional

class SystemUtils:
    @staticmethod
    def get_ffmpeg_path() -> Optional[str]:
        """
        获取 FFmpeg 的路径
        返回: FFmpeg 路径或 None（如果未找到）
        """
        # 检查环境变量中的 ffmpeg
        if sys.platform == 'win32':
            # Windows 系统
            try:
                result = subprocess.run(['where', 'ffmpeg'], capture_output=True, text=True)
                if result.returncode == 0:
                    return result.stdout.strip().split('\n')[0]
            except:
                pass
            
            # 检查常见的 Windows 安装路径
            common_paths = [
                r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
                r'C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe',
                os.path.join(os.getenv('LOCALAPPDATA', ''), 'ffmpeg', 'bin', 'ffmpeg.exe'),
            ]
            for path in common_paths:
                if os.path.isfile(path):
                    return path
                    
        else:
            # macOS 和 Linux 系统
            try:
                # 使用 which 命令查找 ffmpeg
                result = subprocess.run(['which', 'ffmpeg'], capture_output=True, text=True)
                if result.returncode == 0:
                    return result.stdout.strip()
            except:
                pass
            
            # 检查常见的 Unix 安装路径
            common_paths = [
                '/usr/bin/ffmpeg',
                '/usr/local/bin/ffmpeg',
                '/opt/homebrew/bin/ffmpeg',  # macOS Homebrew
                '/opt/local/bin/ffmpeg',     # macOS MacPorts
            ]
            for path in common_paths:
                if os.path.isfile(path):
                    return path
        
        return None

    @staticmethod
    def check_ffmpeg_installation() -> str:
        """
        检查 FFmpeg 是否已安装，并提供安装指导
        返回: 安装指导信息
        """
        if SystemUtils.get_ffmpeg_path():
            return "FFmpeg 已安装"
            
        # 根据不同的操作系统提供安装指导
        if sys.platform == 'win32':
            return """FFmpeg 未找到。请按照以下步骤安装：
1. 访问 https://ffmpeg.org/download.html
2. 下载 Windows 版本
3. 解压下载的文件
4. 将 bin 文件夹添加到系统环境变量
或者使用 Chocolatey 包管理器安装：
> choco install ffmpeg"""
            
        elif sys.platform == 'darwin':
            return """FFmpeg 未找到。请使用以下命令安装：
使用 Homebrew 安装：
> brew install ffmpeg
或使用 MacPorts 安装：
> sudo port install ffmpeg"""
            
        else:
            return """FFmpeg 未找到。请使用系统包管理器安装：
Ubuntu/Debian:
> sudo apt-get update && sudo apt-get install ffmpeg
CentOS/RHEL:
> sudo yum install epel-release && sudo yum install ffmpeg
Fedora:
> sudo dnf install ffmpeg"""

    @staticmethod
    def is_ffmpeg_installed() -> bool:
        """
        检查 FFmpeg 是否已安装
        返回: 布尔值，表示是否已安装
        """
        return SystemUtils.get_ffmpeg_path() is not None 