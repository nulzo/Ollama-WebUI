from django.contrib import admin

from api.models.users import user
from api.models.assistant import assistant
from api.models.conversation import conversation
from api.models.messages import message

admin.site.register(user.CustomUser)
admin.site.register(conversation.Conversation)
admin.site.register(message.Message)
admin.site.register(assistant.Assistant)
