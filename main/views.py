from django.shortcuts import render
from .naat_scrapper import *
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Liked
from django.contrib.auth.models import User
from django.contrib.auth import login,logout,authenticate
from django.shortcuts import redirect

# Create your views here.

def home(request):
    topnaats,pages = SearchNaats('ramzan')
    print('pages', pages)
    if request.user.is_authenticated:
        print('yes')
        print(request.user.username)
        return render(request,'home.html',{'topnaats':topnaats,'pages':pages, 'user':request.user})
    print('NO')
    return render(request,'home.html',{'topnaats':topnaats,'pages':pages})

@csrf_exempt
def ajax(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'get_source':
            url = request.POST.get('naat_url')
            audio = GetAudio(url)
            print(audio['source'])
            download_link = str(audio['source']).replace('https://files.thenaatsharif.com/downloads','https://files.thenaatsharif.com/download/?track=')
       
            return JsonResponse({'src':audio['source'],'download_link':download_link})
        elif action == 'get_lyrics':
            url = request.POST.get('naat_url')
            lyrics = GetLyrics(url)
            return JsonResponse({'lyrics':lyrics})
        elif action == 'like':
            if request.user.is_authenticated:
                url = request.POST.get('naat_url')
                title = request.POST.get('title')
                check_naat = Liked.objects.filter(user=request.user,url=url)
                if len(check_naat) <= 0:
                    obj = Liked(user=request.user,url = url, title=title)
                    obj.save()
                    return JsonResponse({'msg':True})
                check_naat[0].delete()
                return JsonResponse({'msg':'already_liked'})
            
            return JsonResponse({'msg':'Login required!'})
        elif action == 'search':
            query = request.POST.get('query')
            results,pages = SearchNaats(query)
            print(pages)
            return JsonResponse({'result':results,'pages':pages})
        elif action == 'change_page':
            query = request.POST.get('target_url')
            # print(query)
            results,pages = SearchNaats(url=query)
            # print(pages)
            return JsonResponse({'result':results,'pages':pages})
        
def search(request):
    if request.method == 'POST':
        query = request.POST.get('query')
        print(query)
        result = SearchNaats(query)
        return render(request, 'home.html',{'topnaats':result})
    
def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = User.objects.create_user(username = username, emial = email, password = password)
        user.save()
        login(request,user)
        return redirect('/')
    return render(request, 'authentication.html',{'page':'signup'})

def loginview(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username,password=password)
        print('user is ',user)
        if user is not None:
            login(request,user)
            return redirect('/')
        else:
            return JsonResponse({'msg':'User not found'})
            return render(request, 'authentication.html',{'page':'login'})
    return render(request, 'authentication.html',{'page':'login'})

def logoutview(request):
    logout(request)
    return redirect('/')