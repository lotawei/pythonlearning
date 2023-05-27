import re
import requests
import pathlib
from bs4 import BeautifulSoup
from url_manager import Url_Manager
urlmanager = Url_Manager()
rooturl = "http://www.crazyant.net"
urlmanager.addnew_url(rooturl)
data_folder = pathlib.Path("crazyantdata/")
file_to_open = data_folder / "crawallpages.txt"
titlepagetext = open(file_to_open,'w')
while(urlmanager.has_new_url()):
    currenturl = urlmanager.get_url()
    r = requests.get(currenturl,timeout=8)
    if r.status_code != 200:
        print("error,return status code is not 200",currenturl)
        continue
    soup = BeautifulSoup(r.text,"html.parser")
    title = soup.title.string
    titlepagetext.write('%s\t%s\n'%(title,currenturl))
    print('%s\t%s\n'%(title,currenturl))
    titlepagetext.flush()
    links = soup.find_all('a')
    fruits = ['apple', 'banana', 'cherry']
    for link in links:
        href = link.get('href')
        if  href is None:
            continue
        pattern = r'^http://www.crazyant.net/\d+.html$'
        if re.match(pattern=pattern,string=href):
            urlmanager.addnew_url(href)
titlepagetext.close()
print('all page is catched')

