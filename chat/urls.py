from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.chat_view, name='index'),
    path('api/send/', views.send_message, name='send_message'),
    path('api/new-chat/', views.new_chat, name='new_chat'),
    path('api/load-chat/', views.load_current_chat, name='load_chat'),
]