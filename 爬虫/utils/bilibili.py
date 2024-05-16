# 这是一个爬取bilibili的视频脚本 简单介绍了如何使用request 进行视频下载和语音隔离
# 

import requests
import os
from lxml import etree
import re

def videoDownload1(url_):
    # 设置用户代理,cookie
    headers_ = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Cookie': "buvid3=7014DDC0-BF1E-B121-F5A5-F10753C840B423630infoc; i-wanna-go-back=-1; _uuid=49BF2138-1E10F-D5F5-10898-D8311651B53927883infoc; FEED_LIVE_VERSION=V8; DedeUserID=171300042; DedeUserID__ckMd5=c65bec3211413192; CURRENT_FNVAL=4048; rpdid=|(J|)J~m~llk0J'uYm|)~klRl; header_theme_version=CLOSE; hit-new-style-dyn=1; hit-dyn-v2=1; is-2022-channel=1; fingerprint=fe5c7462625770aa2abce449a7c01fd2; buvid_fp_plain=undefined; b_nut=1691207170; b_ut=5; buvid_fp=fe5c7462625770aa2abce449a7c01fd2; LIVE_BUVID=AUTO4016915564967297; buvid4=1AE73807-AEA0-7078-DA57-7F9FE5C3D6F896987-023080912-A0g5nInZwV3VmJJT68FJxw%3D%3D; home_feed_column=5; SESSDATA=fc1266d3%2C1708653865%2C29c08%2A81-i-T9HQrucvpCVcPwSwXl5LmjTyduIzF9veu0KS9i2IwXK_xkcqlt1XQyxJ3sG-9HMSwLwAAKgA; bili_jct=068bc0a79f3fa7aa1a030e478dbf6d4b; sid=5yvjlnfi; browser_resolution=1920-971; bili_ticket=eyJhbGciOiJFUzM4NCIsImtpZCI6ImVjMDIiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE2OTMzNjY1MTcsImlhdCI6MTY5MzEwNzMxNywicGx0IjotMX0.I1Yfp8S9UIkU4S0G5vtBJfslPtgY7QLCj1dx9WQpyRmxKpZoA1qB5UYXNW4KBSZFGljMm7F1lbGXSGco7F79JZJ2sZNBvH9QiSVlmipzAJKaucIoFh6s3m1jpqjLp10r; bili_ticket_expires=1693366517; bp_video_offset_171300042=834376858445283367; b_lsid=1021245DB_18A3567E5C2; CURRENT_QUALITY=80; PVID=2"
    }

    # 发送请求,得到响应对象
    response_ = requests.get(url_, headers=headers_)

    str_data = response_.text  # 视频主页的html代码,类型是字符串

    # 使用xpath解析html代码,,得到想要的url
    html_obj = etree.HTML(str_data)  # 转换格式类型

    # 获取视频的名称
    res_ = html_obj.xpath('//title/text()')[0]
    # 视频名称的获取
    title_ = re.findall(r'(.*?)_哔哩哔哩', res_)[0]
    # 影响视频合成的特殊字符的处理，目前就遇到过这三个，实际上很有可能不止这三个，遇到了就用同样的方法处理就好了
    title_ = title_.replace('/', '')
    title_ = title_.replace(' ', '')
    title_ = title_.replace('&', '')
    title_ = title_.replace(':', '')

    # 使用xpath语法获取数据,取到数据为列表,索引[0]取值取出里面的字符串,即包含视频音频文件的url字符串
    url_list_str = html_obj.xpath('//script[contains(text(),"window.__playinfo__")]/text()')[0]

    # 纯视频的url
    video_url = re.findall(r'"video":\[{"id":\d+,"baseUrl":"(.*?)"', url_list_str)[0]

    # 纯音频的url
    audio_url = re.findall(r'"audio":\[{"id":\d+,"baseUrl":"(.*?)"', url_list_str)[0]

    # 设置跳转字段的headers
    headers_ = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
        'Referer': url_
    }

    # 获取纯视频的数据
    response_video = requests.get(video_url, headers=headers_, stream=True)
    bytes_video = response_video.content
    # 获取纯音频的数据
    response_audio = requests.get(audio_url, headers=headers_, stream=True)
    bytes_audio = response_audio.content

    # 获取文件大小, 单位为KB
    video_size = int(int(response_video.headers['content-length']) / 1024)
    audio_size = int(int(response_audio.headers['content-length']) / 1024)

    # 保存纯视频的文件
    title_1 = title_ + '!'  # 名称进行修改,避免重名
    title_1 = title_1.replace(':', '_')
    
    with open(f'{title_1}.mp4', 'wb') as f:
        f.write(bytes_video)
        # print(f'{title_1}纯视频文件下载完毕...,大小为:{video_size}KB, {int(video_size/1024)}MB')

    with open(f'{title_1}.mp3', 'wb') as f:
        f.write(bytes_audio)
        # print(f'{title_1}纯音频文件下载完毕...,大小为:{audio_size}KB, {int(audio_size/1024)}MB')

        # 利用第三方工具ffmpeg 合成视频, 需要执行终端命令
    ffmpeg_path = r"/opt/homebrew/bin/ffmpeg"
    # os.system(f'{ffmpeg_path} -i {title_1}.mp3 -i {title_1}.mp4 -c copy .\video\{title_}.mp4 -loglevel quiet')


    folder_path = f"/Users/work/Documents/GitHub/pythonlearning/爬虫/utils/download/{title_}"  # 替换为你想要创建的文件夹路径

    if not os.path.exists(folder_path):
        os.mkdir(folder_path)
        # print(f"The folder '{folder_path}' already exists.")


    command = f'{ffmpeg_path} -i {title_1}.mp3 -i {title_1}.mp4 -c copy {folder_path}/{title_}.mp4 -loglevel quiet'

    os.system(command)

    commandaudio = f'{ffmpeg_path} -i {folder_path}/{title_}.mp4 -vn {folder_path}/{title_}.mp3'

    os.system(commandaudio)
    # 显示合成文件的大小

    print(f'{title_}  下载完成')

    # 移除纯视频文件,
    os.remove(f'{title_1}.mp4')
    # 移除纯音频文件,
    os.remove(f'{title_1}.mp3')

def __init__main__():
    # 使用方式可以按需修改地址即可
    videoDownload1('https://www.bilibili.com/video/BV11H4y1s7Rb/?spm_id_from=333.1007.tianma.7-2-24.click&vd_source=432368ab052aeaee4df80d12175bfb3f')
__init__main__()


#基于此脚本可以二次扩展如创造一个窗口程序进行二次开发等需求时可行的


