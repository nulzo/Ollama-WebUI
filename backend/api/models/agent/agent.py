from django.db import models

from api.models.agent.tools import Tool
from api.models.providers.model import Model


class Agent(models.Model):
    # Basic Information
    display_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    icon = models.TextField(null=True, blank=True)
    model = models.CharField(max_length=100)
    system_prompt = models.TextField(null=True, blank=True)
    enabled = models.BooleanField(default=True)

    # Capabilities
    files = models.BooleanField(default=False)
    function_call = models.BooleanField(default=False)
    vision = models.BooleanField(default=False)

    # Basic Parameters
    max_output = models.IntegerField(default=2048)
    tokens = models.IntegerField(default=2048)

    # Advanced Parameters
    num_ctx = models.IntegerField(default=4096)
    low_vram = models.BooleanField(default=False)
    embedding_only = models.BooleanField(default=False)
    seed = models.IntegerField(default=0)
    num_predict = models.IntegerField(default=128)

    # Generation Parameters
    temperature = models.FloatField(default=0.8)
    top_k = models.IntegerField(default=40)
    top_p = models.FloatField(default=0.95)
    tfs_z = models.FloatField(default=1.0)
    typical_p = models.FloatField(default=1.0)
    repeat_last_n = models.IntegerField(default=64)
    repeat_penalty = models.FloatField(default=1.1)
    presence_penalty = models.FloatField(default=0.0)
    frequency_penalty = models.FloatField(default=0.0)
    penalize_newline = models.BooleanField(default=False)
    stop = models.JSONField(default=list)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey("api.CustomUser", on_delete=models.CASCADE)
    base_model = models.ForeignKey(Model, on_delete=models.CASCADE)
    tool = models.ForeignKey(
        Tool, on_delete=models.SET_NULL, null=True, blank=True, related_name="agents"
    )

    def __str__(self):
        return self.display_name
