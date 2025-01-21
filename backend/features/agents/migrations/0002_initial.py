# Generated by Django 5.1.4 on 2025-01-19 23:12

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("agents", "0001_initial"),
        ("knowledge", "0001_initial"),
        ("tools", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="agent",
            name="knowledge_base",
            field=models.ManyToManyField(blank=True, to="knowledge.knowledge"),
        ),
        migrations.AddField(
            model_name="agent",
            name="tools",
            field=models.ManyToManyField(blank=True, to="tools.tool"),
        ),
        migrations.AddField(
            model_name="agent",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="agent",
            name="model",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="agents.agentmodel"
            ),
        ),
        migrations.AddField(
            model_name="agentmodel",
            name="provider",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="agents.agentprovider"
            ),
        ),
        migrations.AddField(
            model_name="agent",
            name="provider",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="agents.agentprovider"
            ),
        ),
        migrations.AlterUniqueTogether(
            name="agentmodel",
            unique_together={("provider", "name")},
        ),
        migrations.AlterUniqueTogether(
            name="agent",
            unique_together={("user", "display_name")},
        ),
    ]