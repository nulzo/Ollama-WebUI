from django.db import models
from api.models.users.user import CustomUser

class Tool(models.Model):
    # Basic Information
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    function_content = models.TextField()
    language = models.CharField(
        max_length=20,
        choices=[
            ('python', 'Python'),
            ('javascript', 'JavaScript'),
            ('typescript', 'TypeScript')
        ],
        default='python'
    )
    
    # Function Metadata
    parameters = models.JSONField(help_text="JSON schema for function parameters")
    returns = models.JSONField(help_text="JSON schema for return value")
    docstring = models.TextField(help_text="Google-style docstring for the function")
    
    # Status and Metadata
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='tools'
    )

    class Meta:
        db_table = 'tools'
        ordering = ['-created_at']
        unique_together = ['name', 'created_by']

    def __str__(self):
        return f"{self.name} ({self.language})"