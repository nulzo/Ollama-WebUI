# Generated by Django 5.1.4 on 2025-01-19 23:12

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Model",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100)),
                ("display_name", models.CharField(max_length=100)),
                (
                    "provider",
                    models.CharField(
                        choices=[
                            ("ollama", "Ollama"),
                            ("openai", "OpenAI"),
                            ("anthropic", "Anthropic"),
                            ("azure", "Azure OpenAI"),
                        ],
                        max_length=20,
                    ),
                ),
                ("capabilities", models.JSONField(default=dict)),
                ("enabled", models.BooleanField(default=True)),
            ],
            options={
                "unique_together": {("name", "provider")},
            },
        ),
        migrations.CreateModel(
            name="ProviderSettings",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "provider_type",
                    models.CharField(
                        choices=[
                            ("ollama", "Ollama"),
                            ("openai", "OpenAI"),
                            ("anthropic", "Anthropic"),
                            ("azure", "Azure OpenAI"),
                        ],
                        max_length=50,
                    ),
                ),
                (
                    "api_key",
                    models.CharField(
                        blank=True,
                        help_text="API key for the provider (if required)",
                        max_length=255,
                        null=True,
                    ),
                ),
                (
                    "endpoint",
                    models.CharField(
                        blank=True,
                        help_text="Custom endpoint URL (if required)",
                        max_length=255,
                        null=True,
                    ),
                ),
                (
                    "organization_id",
                    models.CharField(
                        blank=True,
                        help_text="Organization ID (if required)",
                        max_length=255,
                        null=True,
                    ),
                ),
                (
                    "is_enabled",
                    models.BooleanField(
                        default=True, help_text="Whether this provider is enabled for the user"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="provider_settings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Provider Setting",
                "verbose_name_plural": "Provider Settings",
                "unique_together": {("user", "provider_type")},
            },
        ),
    ]