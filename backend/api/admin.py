from django.contrib import admin

from api.models.auth import user
from api.models.chat import assistant, conversation, message

admin.site.register(user.CustomUser)
admin.site.register(conversation.Conversation)
admin.site.register(message.Message)
admin.site.register(assistant.Assistant)
