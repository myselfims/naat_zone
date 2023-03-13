from django.contrib import admin
from django.urls import path
from main import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/',views.signup,name='signup'),
    path('login/',views.loginview,name='login'),
    path('ajax/',views.ajax,name='ajax'),
    path('logout',views.logoutview,name='logout'),
    # path('player/',views.player, name='player'),
    # path('/<str:artist>/',views.artist, name='artish'),
    # path('favorite/',views.favorite,name='favorite'),
    path('search/',views.search, name='search')
]