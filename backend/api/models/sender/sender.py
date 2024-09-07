from django.db import models


class Sender(models.Model):
    def get_user(self):
        return getattr(self, "user", None)

    def get_assistant(self):
        return getattr(self, "assistant", None)
