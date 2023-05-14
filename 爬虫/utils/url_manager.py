class Url_Manager:
 def __init__(self):
    self.new_urls = set()
    self.old_urls = set()
 def addnew_url(self,url):
    if url is None or len(url) == 0 :
       print('url empty')
       return 
    self.old_urls = self.new_urls
    self.new_urls.add(url);
 def get_url(self):
    if self.has_new_url():
       url = self.new_urls.pop()
       return url 
    else:
        return None
 def addnew_urls(self,urls):
    if urls is None or len(urls) == 0 :
       print('urls empty')
    self.old_urls = self.new_urls
    for url in urls:
        self.addnew_url(url)
 def has_new_url(self):
    return len(self.new_urls)
if __name__ == '__main__':
   urlmanager = Url_Manager()
   urlmanager.addnew_url('https://www.baidu.com')
   urlmanager.addnew_url('https://www.baidu.com')
   print( urlmanager.get_url())
   print(urlmanager.new_urls)
 
  