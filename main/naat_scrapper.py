from bs4 import BeautifulSoup
# from bs4 import 
import requests
from pytube import Search



def SearchNaats(name=None,url=None):
    query = str(name)
    query = query.replace(' ','+')
    if url is not None:
        r = requests.get(url=url)
    else:
        r = requests.get(url=f'https://thenaatsharif.com/?s={query}')
    html = r.content
    soup = BeautifulSoup(html,'html.parser')
    links = soup.find_all('h2',attrs={'class':'entry-title'})
    page_div = str(soup.find_all('div',{'class':'nav-links'}))
    to_remove = {'[':'',
                 ']':'',
                '<a':'<button',
                'href=':'onclick=\'ChangePage(',
                '">':"\")\'>",
                'nt)':'"',
                'nav-links)':'nav-links"',
                '</a>': '</button>',
                'dots)':'"'
    }
  
    for char in to_remove.keys():
        page_div = page_div.replace(char,to_remove[char])

    naats = []
    for link in links:
        link = link.find('a')
        title = link.getText()
        l = str(link.get('href'))
        artist = str(l).replace('https://thenaatsharif.com/','')
        artist = artist[:artist.find('/')]
        # s = Search(str(title).lower()+artist)
        # v = str(s.results[0])
        # vid = v[41:].replace('>','')
        img_url = f'https://static.vecteezy.com/system/resources/thumbnails/009/313/617/small/vinyl-record-vector-illustration-isolated-on-white-background-free-png.png'
        naat = {
            'title':title,
            'link':l,
            'naat_khwan': artist.replace('-',' ').capitalize(),
            'thumbnail':img_url
        }
        naats.append(naat)
    return naats,page_div
    

def GetNaatKhawans(url=None):
    if url is None:
        r = requests.get(url='https://thenaatsharif.com/naat-khawans/')
        html = r.content
        soup = BeautifulSoup(html,'html.parser')
        elem = soup.find_all('li',{'class':'cat-item'})
        a = []
        for i in elem:
            for e in i.children:
                
                dic = {
                    'link': str(e)[str(e).find('=')+1:str(e).find('>')].replace('"',''),
                    'name': e.getText()
                }
                a.append(dic)     

        return a
    naat,page_div = SearchNaats(url=url)
    return naat,page_div
        
        
GetNaatKhawans(url='https://thenaatsharif.com/junaid-jamshed/')

def GetAudio(url):
    try: 
        r = requests.get(url=url)
        html = r.content
        soup = BeautifulSoup(html, 'html.parser')
        # down_a = soup.find('a',{'class':'download-page-link'})
        # down_link = down_a.get('href')
        # print(down_link)
        audio = soup.find('audio')
        source = audio.get('src')
        t = soup.find('h1',{'class':'entry-title'})
        artist = str(url).replace('https://thenaatsharif.com/','')
        artist = artist[:artist.find('/')]
        # s = Search(str(t.getText()).lower()+artist)
        # print(str(t.getText()).lower()+artist)
        # v = str(s.results[0])
        # vid = v[41:].replace('>','')
        # img_url = f'https://img.youtube.com/vi/{vid}/hqdefault.jpg'
        return {'source':source} 
    except:
        return {'source':'None'}
    
    
# GetAudio('https://thenaatsharif.com/hafiz-ahmed-raza-qadri/sar-e-la-makan-se-talab/')

def GetLyrics(url):
    r = requests.get(url)
    html  = r.content
    soup = BeautifulSoup(html, 'html.parser')
    lyrics = soup.find('div',{'class':'lyrics_container'}).children
    innerhtml = ''
    for i in lyrics:
        innerhtml = innerhtml + str(i)
    return innerhtml

def YtSrapper(url):
    r = requests.get(url=url)
    html = r.content
    soup = BeautifulSoup(html, 'html.parser')
    audio = soup.find('audio')
    source = audio.get('src')
    t = soup.find('h1',{'class':'entry-title'})
    title = t.getText()
    nr = requests.get(url='https://www.google.com/search?rlz=1C1RXQR_enIN965IN965&sxsrf=AJOqlzVl07Lky1g4Am18_f8UnSvmXPbVRA:1677374754524&q=sar+e+la+makan+se+talab+hafiz-ahmed-raza-qadri&tbm=isch&sa=X&ved=2ahUKEwi47pfzg7L9AhX-XmwGHZldCigQ0pQJegQIDhAB&biw=1450&bih=667&dpr=1.32')
    html2 = nr.content
    soup2 = BeautifulSoup(html2,'html.parser')
    a = soup2.find_all('h3')
   

# YtSrapper('https://thenaatsharif.com/hafiz-ahmed-raza-qadri/sar-e-la-makan-se-talab/')