from bs4 import BeautifulSoup
import requests
#格式  {'url':{'header': 'text': 'response'}}
class Url_Analy_Tool:
    def __init__(self):
        self.soup = BeautifulSoup(from_encoding='utf-8')
        self.mapurlData = {}
    def analysis_url(self,url):
        if url is None or len(url) == 0:
            return
        if self.mapurlData.get(url) is None:
            response = requests.get(url)
            self.mapurlData[url] = BeautifulSoup(response.text,'html.parser',from_encoding='utf-8')
        return self.mapurlData[url]
if __name__ == '__main__':
    analytool = Url_Analy_Tool()
    soup =  analytool.analysis_url('https://baidu.com')
    soup1 =  analytool.analysis_url('https://ipv4.geojs.io/')
    print(soup.find('a'))
    print(soup.find('input'))
    print(soup1)
        