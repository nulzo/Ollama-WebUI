from django.contrib import admin

from api.models import chat, message, user

admin.site.register(user.UserSettings)
admin.site.register(chat.Chat)
admin.site.register(message.Message)
