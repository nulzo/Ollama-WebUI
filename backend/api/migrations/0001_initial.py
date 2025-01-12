# Generated by Django 5.1.4 on 2024-12-20 20:03

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="AgentProvider",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=50)),
                ("display_name", models.CharField(max_length=100)),
                ("is_enabled", models.BooleanField(default=True)),
                ("requires_api_key", models.BooleanField(default=True)),
                ("supports_streaming", models.BooleanField(default=True)),
                ("supports_functions", models.BooleanField(default=True)),
                ("supports_vision", models.BooleanField(default=False)),
                ("default_parameters", models.JSONField(default=dict)),
            ],
            options={
                "verbose_name_plural": "Agent Providers",
            },
        ),
        migrations.CreateModel(
            name="Assistant",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=100, unique=True)),
                ("display_name", models.CharField(max_length=100)),
                ("icon", models.TextField(blank=True, null=True)),
                ("description", models.TextField(blank=True, max_length=500, null=True)),
                ("api_key", models.CharField(blank=True, max_length=255, null=True)),
                ("default_temperature", models.FloatField(default=0.7)),
                ("default_max_tokens", models.IntegerField(default=150)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="CustomUser",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={"unique": "A user with that username already exists."},
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[django.contrib.auth.validators.UnicodeUsernameValidator()],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(blank=True, max_length=150, verbose_name="first name"),
                ),
                (
                    "last_name",
                    models.CharField(blank=True, max_length=150, verbose_name="last name"),
                ),
                (
                    "email",
                    models.EmailField(blank=True, max_length=254, verbose_name="email address"),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                ("name", models.CharField(max_length=150)),
                ("icon", models.ImageField(blank=True, null=True, upload_to="icons/")),
                ("description", models.TextField(blank=True, max_length=500, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("last_login", models.DateTimeField(blank=True, null=True)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "verbose_name": "User",
                "verbose_name_plural": "Users",
                "db_table": "user",
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="AgentModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("display_name", models.CharField(max_length=100)),
                ("capabilities", models.JSONField(default=dict)),
                ("parameters", models.JSONField(default=dict)),
                ("is_enabled", models.BooleanField(default=True)),
                (
                    "provider",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="api.agentprovider"
                    ),
                ),
            ],
            options={
                "unique_together": {("provider", "name")},
            },
        ),
        migrations.CreateModel(
            name="Conversation",
            fields=[
                (
                    "uuid",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("name", models.CharField(blank=True, default="", max_length=150, null=True)),
                ("is_pinned", models.BooleanField(db_index=True, default=False)),
                ("is_hidden", models.BooleanField(db_index=True, default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True, db_index=True)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="conversations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="CustomPrompt",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=255)),
                ("command", models.CharField(max_length=100, unique=True)),
                ("content", models.TextField()),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="custom_prompts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "Custom Prompts",
            },
        ),
        migrations.CreateModel(
            name="Knowledge",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("identifier", models.CharField(max_length=255, unique=True)),
                ("content", models.TextField()),
                ("embedding", models.JSONField(blank=True, null=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="knowledge_documents",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "Knowledge",
            },
        ),
        migrations.CreateModel(
            name="Message",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("user", "User"),
                            ("assistant", "Assistant"),
                            ("system", "System"),
                        ],
                        db_index=True,
                        max_length=25,
                    ),
                ),
                ("content", models.TextField()),
                ("has_images", models.BooleanField(default=False)),
                ("model", models.CharField(max_length=120)),
                (
                    "conversation",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="messages",
                        to="api.conversation",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="LikedMessage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("liked_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="liked_messages",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "message",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="liked_by",
                        to="api.message",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="DeletedMessage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("liked_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="deleted_messages",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "message",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="deleted_by",
                        to="api.message",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="MessageImage",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("image", models.FileField(upload_to="message_images/%Y/%m/%d/")),
                ("order", models.IntegerField(default=0)),
                (
                    "message",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="message_images",
                        to="api.message",
                    ),
                ),
            ],
            options={
                "ordering": ["order"],
            },
        ),
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
            name="PinnedMessage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("pinned_at", models.DateTimeField(auto_now_add=True)),
                (
                    "message",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pinned_by",
                        to="api.message",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pinned_messages",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
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
            },
        ),
        migrations.CreateModel(
            name="Settings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("theme", models.CharField(default="dark", max_length=30)),
                ("default_model", models.CharField(default="llama3.2:3b", max_length=50)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "Settings",
            },
        ),
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
            },
        ),
        migrations.CreateModel(
            name="Agent",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("display_name", models.CharField(max_length=100)),
                ("description", models.TextField(blank=True, null=True)),
                ("icon", models.TextField(blank=True, null=True)),
                ("system_prompt", models.TextField(blank=True, null=True)),
                ("parameters", models.JSONField(default=dict)),
                ("enabled", models.BooleanField(default=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "model",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="api.agentmodel"
                    ),
                ),
                (
                    "provider",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="api.agentprovider"
                    ),
                ),
                ("knowledge_base", models.ManyToManyField(blank=True, to="api.knowledge")),
                ("tools", models.ManyToManyField(blank=True, to="api.tool")),
            ],
        ),
        migrations.AddIndex(
            model_name="conversation",
            index=models.Index(
                fields=["user_id", "deleted_at", "-updated_at"],
                name="conv_user_deleted_updated_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="customprompt",
            index=models.Index(fields=["command"], name="api_customp_command_4544ce_idx"),
        ),
        migrations.AddIndex(
            model_name="customprompt",
            index=models.Index(
                fields=["user", "created_at"], name="api_customp_user_id_5c176e_idx"
            ),
        ),
        migrations.AlterUniqueTogether(
            name="customprompt",
            unique_together={("command", "user")},
        ),
        migrations.AddIndex(
            model_name="knowledge",
            index=models.Index(fields=["identifier"], name="api_knowled_identif_346f54_idx"),
        ),
        migrations.AddIndex(
            model_name="knowledge",
            index=models.Index(
                fields=["user", "created_at"], name="api_knowled_user_id_d4b518_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="message",
            index=models.Index(
                fields=["created_at", "role"], name="api_message_created_213207_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="message",
            index=models.Index(
                fields=["conversation", "created_at"], name="api_message_convers_ece45b_idx"
            ),
        ),
        migrations.AlterUniqueTogether(
            name="likedmessage",
            unique_together={("user", "message")},
        ),
        migrations.AlterUniqueTogether(
            name="deletedmessage",
            unique_together={("user", "message")},
        ),
        migrations.AlterUniqueTogether(
            name="pinnedmessage",
            unique_together={("user", "message")},
        ),
        migrations.AlterUniqueTogether(
            name="providersettings",
            unique_together={("user", "provider_type")},
        ),
        migrations.AlterUniqueTogether(
            name="tool",
            unique_together={("name", "created_by")},
        ),
        migrations.AlterUniqueTogether(
            name="agent",
            unique_together={("user", "display_name")},
        ),
    ]
