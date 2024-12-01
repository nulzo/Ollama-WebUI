from django.db import models
from api.models.auth.user import CustomUser
from django.core.exceptions import ValidationError
import json
from django.core.validators import RegexValidator


class Tool(models.Model):
    # Basic Information
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    function_content = models.TextField(
        validators=[
            RegexValidator(
                regex=r"^[a-zA-Z0-9_\s\(\)\{\}\[\]:,\"\']+$",
                message="Function content contains invalid characters",
            )
        ]
    )
    language = models.CharField(
        max_length=20,
        choices=[("python", "Python"), ("javascript", "JavaScript"), ("typescript", "TypeScript")],
        default="python",
    )

    # Function Metadata
    parameters = models.JSONField(help_text="JSON schema for function parameters")
    returns = models.JSONField(help_text="JSON schema for return value")
    docstring = models.TextField(help_text="Google-style docstring for the function")

    # Status and Metadata
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="tools")

    def clean(self):
        try:
            # Validate JSON schema format
            if not isinstance(self.parameters, dict):
                self.parameters = json.loads(self.parameters)

            required_keys = {"type", "properties"}
            if not all(key in self.parameters for key in required_keys):
                raise ValidationError("Invalid JSON schema format")
        except json.JSONDecodeError:
            raise ValidationError("Invalid JSON format")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        db_table = "tools"
        ordering = ["-created_at"]
        unique_together = ["name", "created_by"]

    def __str__(self):
        return f"{self.name} ({self.language})"
