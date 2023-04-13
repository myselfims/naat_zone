from django.shortcuts import render
from .naat_scrapper import *
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Liked
from django.contrib.auth.models import User
from django.contrib.auth import login,logout,authenticate
from django.shortcuts import redirect
import json

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
            liked = False
                
            audio = GetAudio(url)
            check = Liked.objects.filter(url=url)
            liked = False
            if len(check)>0:
                liked = True
            print(audio['source'])
            download_link = str(audio['source']).replace('https://files.thenaatsharif.com/downloads','https://files.thenaatsharif.com/download/?track=')
       
            return JsonResponse({'src':audio['source'],'download_link':download_link,'liked':liked})
        elif action == 'get_lyrics':
            url = request.POST.get('naat_url')
            lyrics = GetLyrics(url)
            return JsonResponse({'lyrics':lyrics})
        elif action == 'like':
            if request.user.is_authenticated:
                url = request.POST.get('naat_url')
                title = request.POST.get('title')
                naat_khwan = request.POST.get('naat_khwan')
                print('naat khwan is ',naat_khwan)
                check_naat = Liked.objects.filter(user=request.user,url=url)
                if len(check_naat) <= 0:
                    obj = Liked(user=request.user,url = url, title=title,naat_khwan=naat_khwan)
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
        elif action == 'get_artist':
            query = request.POST.get('query')
            print('running...')
            print(query)
            if str(query) != 'None':
                results,pages = GetNaatKhawans(url=query)
                return JsonResponse({'result':results,'pages':pages})
            results = GetNaatKhawans()
            print(results)
            return JsonResponse({'result':results})
        elif action == 'load_favorite':
            print('worked')
            if request.user.is_authenticated:
                naats = Liked.objects.filter(user=request.user).values()
                print('working')
                print(naats)
                if len(naats)>0:
                    return JsonResponse({'naats':list(naats)})
            return JsonResponse({'naats':False})
        elif action == 'check_like':
            if request.user.is_authenticated:
                url = request.POST.get('url')
                check = Liked.objects.filter(user=request.user,url=url)
                if len(check) > 0:
                    return JsonResponse({'like':True})
            return JsonResponse({'like':False})
        elif action == 'signup':
            print('signup')
            username = request.POST.get('username')
            password = request.POST.get('username')
            email = request.POST.get('username')
            check = User.objects.filter(username=username)
            if len(check)<=0:
                user = User.objects.create_user(username=username,password=password,email=email)
                login(request,user)
                user.save()
                return JsonResponse({'signup':True})
            return JsonResponse({'signup':False})
        elif action == 'login':
            print('login')
            username = request.POST.get('username')
            password = request.POST.get('username')
            user = authenticate(username=username,password=password)
            if user is not None:
                login(request,user)
                return JsonResponse({'login':True})
            else:
                return JsonResponse({'login':False})
        elif action == 'logout':
            logout(request)
            return JsonResponse({'logout':True})

        
        
