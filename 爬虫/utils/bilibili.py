# 这是一个爬取bilibili的视频脚本 简单介绍了如何使用request 进行视频下载和语音隔离
# 

import requests
import os
from lxml import etree
import re
import json
from typing import Dict, List, Optional
from system_utils import SystemUtils
import time

class BilibiliDownloader:
    def __init__(self):
        self.base_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Cookie': "buvid3=7014DDC0-BF1E-B121-F5A5-F10753C840B423630infoc; i-wanna-go-back=-1; _uuid=49BF2138-1E10F-D5F5-10898-D8311651B53927883infoc; FEED_LIVE_VERSION=V8; DedeUserID=171300042; DedeUserID__ckMd5=c65bec3211413192; CURRENT_FNVAL=4048"
        }
        
        # 设置默认下载路径为应用程序目录下的 downloads 文件夹
        self.download_base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'downloads')
        # 确保下载目录存在
        if not os.path.exists(self.download_base_path):
            os.makedirs(self.download_base_path)
            
        # 检测 FFmpeg 路径
        self.ffmpeg_path = f'"{SystemUtils.get_ffmpeg_path()}"'
        if not self.ffmpeg_path:
            raise RuntimeError(SystemUtils.check_ffmpeg_installation())

    def _get_video_info(self, url: str) -> tuple:
        """获取视频信息，返回标题和视频/音频URL"""
        try:
            response = requests.get(url, headers=self.base_headers)
            if response.status_code != 200:
                raise Exception(f"请求失败，状态码: {response.status_code}")
                
            html_obj = etree.HTML(response.text)
            if html_obj is None:
                raise Exception("页面解析失败")
            
            # 获取视频标题
            title_elements = html_obj.xpath('//title/text()')
            if not title_elements:
                raise Exception("无法获取视频标题")
            title = self._clean_title(title_elements[0])
            
            # 获取视频和音频URL
            scripts = html_obj.xpath('//script[contains(text(),"window.__playinfo__")]/text()')
            if not scripts:
                raise Exception("无法获取视频信息")
            
            url_list_str = scripts[0]
            video_urls = re.findall(r'"video":\[{"id":\d+,"baseUrl":"(.*?)"', url_list_str)
            audio_urls = re.findall(r'"audio":\[{"id":\d+,"baseUrl":"(.*?)"', url_list_str)
            
            if not video_urls or not audio_urls:
                raise Exception("无法解析视频/音频URL")
                
            return title, video_urls[0], audio_urls[0]
        except Exception as e:
            raise Exception(f"获取视频信息失败: {str(e)}")

    def _clean_title(self, title: str) -> str:
        """清理视频标题中的特殊字符"""
        title = re.findall(r'(.*?)_哔哩哔哩', title)[0]
        for char in ['/', ' ', '&', ':', '?', '*', '<', '>', '|', '"']:
            title = title.replace(char, '')
        return title

    def _download_media(self, url: str, headers: Dict, is_video: bool = True) -> bytes:
        """下载视频或音频内容"""
        try:
            response = requests.get(url, headers=headers, stream=True)
            if response.status_code != 200:
                raise Exception(f"下载失败，状态码: {response.status_code}")
            return response.content
        except Exception as e:
            raise Exception(f"{'视频' if is_video else '音频'}下载失败: {str(e)}")

    def _create_folder(self, folder_path: str) -> None:
        """创建下载文件夹"""
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

    def _combine_video_audio(self, video_path: str, audio_path: str, output_path: str) -> None:
        """合并视频和音频"""
        # 使用引号包裹文件路径，并转义特殊字符
        video_path = f'"{video_path}"'
        audio_path = f'"{audio_path}"'
        output_path = f'"{output_path}"'
        command = f'{self.ffmpeg_path} -i {audio_path} -i {video_path} -c copy {output_path} -loglevel quiet'
        print(f"执行合并命令: {command}")
        result = os.system(command)
        print(f"合并命令执行结果: {result}")

    def _extract_audio(self, video_path: str, audio_output: str) -> None:
        """从视频中提取音频"""
        # 使用引号包裹文件路径，并转义特殊字符
        video_path = f'"{video_path}"'
        audio_output = f'"{audio_output}"'
        command = f'{self.ffmpeg_path} -i {video_path} -vn {audio_output}'
        print(f"执行音频提取命令: {command}")
        result = os.system(command)
        print(f"音频提取命令执行结果: {result}")

    def download_single_video(self, url: str) -> None:
        """下载单个视频"""
        try:
            # 获取视频信息
            title, video_url, audio_url = self._get_video_info(url)
            
            # 设置下载headers
            download_headers = {
                'User-Agent': self.base_headers['User-Agent'],
                'Referer': url
            }

            # 下载视频和音频
            temp_video_path = f'{title}!.mp4'
            temp_audio_path = f'{title}!.mp3'
            
            video_content = self._download_media(video_url, download_headers)
            audio_content = self._download_media(audio_url, download_headers)

            # 保存临时文件
            with open(temp_video_path, 'wb') as f:
                f.write(video_content)
            with open(temp_audio_path, 'wb') as f:
                f.write(audio_content)

            # 创建输出文件夹
            folder_path = os.path.join(self.download_base_path, title)
            self._create_folder(folder_path)

            # 合并视频和音频
            output_video = os.path.join(folder_path, f'{title}.mp4')
            output_audio = os.path.join(folder_path, f'{title}.mp3')
            
            self._combine_video_audio(temp_video_path, temp_audio_path, output_video)
            self._extract_audio(output_video, output_audio)

            # 清理临时文件
            os.remove(temp_video_path)
            os.remove(temp_audio_path)

            print(f'{title} 下载完成')
            
        except Exception as e:
            print(f'下载失败: {str(e)}')

    def download_playlist(self, playlist_url: str) -> None:
        """下载整个播放列表"""
        try:
            # 提取用户ID和列表ID
            uid = re.search(r'space.bilibili.com/(\d+)', playlist_url).group(1)
            list_id = re.search(r'lists/(\d+)', playlist_url).group(1)
            
            # 获取播放列表数据
            api_url = f'https://api.bilibili.com/x/space/fav/season/list?season_id={list_id}&pn=1&ps=20&order=mtime'
            response = requests.get(api_url, headers=self.base_headers)
            data = response.json()
            
            if data['code'] == 0 and 'data' in data:
                videos = data['data']['medias']
                for video in videos:
                    video_url = f'https://www.bilibili.com/video/{video["bvid"]}'
                    print(f"开始下载: {video['title']}")
                    self.download_single_video(video_url)
            
        except Exception as e:
            print(f'获取播放列表失败: {str(e)}')

    def get_playlist_info(self, playlist_url: str) -> Dict:
        """获取播放列表的详细信息，包括标题、标签和视频列表"""
        try:
            uid = re.search(r'space.bilibili.com/(\d+)', playlist_url).group(1)
            list_id = re.search(r'lists/(\d+)', playlist_url).group(1)
            
            # 获取播放列表数据
            api_url = f'https://api.bilibili.com/x/space/fav/season/list?season_id={list_id}&pn=1&ps=100&order=mtime'
            response = requests.get(api_url, headers=self.base_headers)
            data = response.json()
            
            if data['code'] == 0 and 'data' in data:
                videos_data = data['data']['medias']
                
                # 提取所有视频的标签
                all_tags = set()
                videos_info = []
                
                for video in videos_data:
                    # 提取视频信息
                    video_info = {
                        'title': video['title'],
                        'bvid': video['bvid'],
                        'duration': video['duration'],
                        'description': video.get('desc', ''),
                        'tags': [],
                        'url': f'https://www.bilibili.com/video/{video["bvid"]}'
                    }
                    
                    # 提取标签（如果有的话）
                    if 'tags' in video:
                        video_info['tags'] = [tag['tag_name'] for tag in video['tags']]
                        all_tags.update(video_info['tags'])
                    
                    videos_info.append(video_info)
                
                return {
                    'success': True,
                    'playlist_title': data['data'].get('title', '未命名播放列表'),
                    'video_count': len(videos_info),
                    'all_tags': list(all_tags),
                    'videos': videos_info
                }
            
            return {
                'success': False,
                'error': '获取播放列表数据失败'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def download_selected_videos(self, video_urls: List[str]) -> None:
        """下载选定的视频"""
        for url in video_urls:
            try:
                print(f"开始下载: {url}")
                self.download_single_video(url)
            except Exception as e:
                print(f'下载失败 {url}: {str(e)}')

    def download_video(self, url: str, title: str) -> None:
        """下载单个视频，使用指定的标题"""
        try:
            print(f"开始下载视频: {url}")
            print(f"保存标题: {title}")
            
            # 更新headers添加更多必要的字段
            self.base_headers.update({
                'Referer': 'https://www.bilibili.com',
                'Accept': '*/*',
                'Origin': 'https://www.bilibili.com',
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
            })
            
            # 获取视频信息
            _, video_url, audio_url = self._get_video_info(url)
            
            # 设置下载headers
            download_headers = self.base_headers.copy()
            download_headers['Referer'] = url
            
            # 创建输出文件夹
            folder_path = os.path.join(self.download_base_path, title)
            self._create_folder(folder_path)
            
            # 设置临时文件路径
            temp_video_path = os.path.join(folder_path, f'temp_video_{int(time.time())}.mp4')
            temp_audio_path = os.path.join(folder_path, f'temp_audio_{int(time.time())}.mp3')
            
            try:
                # 下载视频
                print("下载视频流...")
                video_content = self._download_media(video_url, download_headers, True)
                with open(temp_video_path, 'wb') as f:
                    f.write(video_content)
                
                # 下载音频
                print("下载音频流...")
                audio_content = self._download_media(audio_url, download_headers, False)
                with open(temp_audio_path, 'wb') as f:
                    f.write(audio_content)
                
                # 设置输出文件路径
                output_video = os.path.join(folder_path, f'{title}.mp4')
                output_audio = os.path.join(folder_path, f'{title}.mp3')
                
                # 合并文件
                print("合并视频和音频...")
                self._combine_video_audio(temp_video_path, temp_audio_path, output_video)
                print("提取音频...")
                self._extract_audio(output_video, output_audio)
                
            finally:
                # 清理临时文件
                print("清理临时文件...")
                if os.path.exists(temp_video_path):
                    os.remove(temp_video_path)
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)
            
            print(f"下载完成: {title}")
            
        except Exception as e:
            print(f"下载失败: {str(e)}")
            import traceback
            print(traceback.format_exc())

def main():
    downloader = BilibiliDownloader()
    playlist_url = 'https://space.bilibili.com/318331/lists/4197997?type=season'
    downloader.download_playlist(playlist_url)

if __name__ == "__main__":
    main()



