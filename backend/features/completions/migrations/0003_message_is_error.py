# Generated by Django 5.1.4 on 2025-02-23 22:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("completions", "0002_message_name_message_provider_alter_message_model"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="is_error",
            field=models.BooleanField(default=False),
        ),
    ]
