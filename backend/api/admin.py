from django.contrib import admin

from api.models import conversation, message, user, assistant

admin.site.register(user.CustomUser)
admin.site.register(conversation.Conversation)
admin.site.register(message.Message)
admin.site.register(assistant.Assistant)
