# Generated by Django 5.1.4 on 2025-02-03 23:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Tool",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=100, unique=True)),
                ("description", models.TextField()),
                (
                    "function_content",
                    models.TextField(
                        help_text="The content of the function to be executed. This should be a valid Python function."
                    ),
                ),
                (
                    "language",
                    models.CharField(
                        choices=[
                            ("python", "Python"),
                            ("javascript", "JavaScript"),
                            ("typescript", "TypeScript"),
                        ],
                        default="python",
                        max_length=20,
                    ),
                ),
                ("parameters", models.JSONField(help_text="JSON schema for function parameters")),
                ("returns", models.JSONField(help_text="JSON schema for return value")),
                (
                    "docstring",
                    models.TextField(help_text="Google-style docstring for the function"),
                ),
                ("is_enabled", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("modified_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tools",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "tools",
                "ordering": ["-created_at"],
                "unique_together": {("name", "created_by")},
            },
        ),
    ]
