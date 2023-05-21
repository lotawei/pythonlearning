import requests
from bs4 import BeautifulSoup
response = requests.get('https://www.baidu.com')
print(response.status_code)
print(response.text)

print(response.headers)

print(response.encoding)
