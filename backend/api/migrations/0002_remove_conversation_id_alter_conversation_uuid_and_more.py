# Generated by Django 5.0.4 on 2024-10-15 04:30

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="conversation",
            name="id",
        ),
        migrations.AlterField(
            model_name="conversation",
            name="uuid",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True
            ),
        ),
        migrations.AlterField(
            model_name="message",
            name="conversation",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="messages",
                to="api.conversation",
            ),
        ),
    ]
