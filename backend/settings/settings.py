import logging.config
import os
from pathlib import Path

from dotenv import load_dotenv
from rich.logging import RichHandler

from features import agents, authentication, completions, conversations, knowledge, prompts, providers, tags, tools
from features.agents.apps import AgentsConfig
from api.middleware.csrf_middleware import CsrfExemptMiddleware

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv()

SECRET_KEY = "django-insecure-u98dn^i6(rfh=n1sl10n-ar84+5cz1c2mb-a8@$lb+qewaf&vo"

DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

DEBUG = True

OLLAMA_ENDPOINT = os.environ.get("OLLAMA_ENDPOINT", "http://192.168.0.25:11434")

OPENAI_HOST = ""

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "backend",
    "host.docker.internal",
]

CHROMA_PERSIST_DIR = "data/chromadb"

CHROMA_SETTINGS = {
    "allow_reset": False,
    "is_persistent": True,
    "anonymized_telemetry": False,
}

EMBEDDING_MODEL = "nomic-embed-text"

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5073",
    "http://127.0.0.1:5073",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:4200",
    "http://localhost:4200",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:6969",
    "http://localhost:6969",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
    "http://192.168.0.90:6969",
    "http://host.docker.internal:6969",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework.authtoken",
    "django_extensions",
    "api.apps.ApiConfig",
    "rest_framework",
    "corsheaders",
    "features.agents.apps.AgentsConfig",
    "features.authentication.apps.AuthenticationConfig",
    "features.completions.apps.CompletionsConfig",
    "features.conversations.apps.ConversationsConfig",
    "features.knowledge.apps.KnowledgeConfig",
    "features.prompts.apps.PromptsConfig",
    "features.providers.apps.ProvidersConfig",
    "features.tags.apps.TagsConfig",
    "features.tools.apps.ToolsConfig",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "api.middleware.csrf_middleware.CsrfExemptMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "api.middleware.AuthenticationMiddleware",
]

ROOT_URLCONF = "settings.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
        "api.utils.renderers.EventStreamRenderer",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

ASGI_APPLICATION = "settings.asgi.application"

AUTH_USER_MODEL = "authentication.CustomUser"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Logging Configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "rich": {
            "datefmt": "[%X]",
            "format": "%(message)s",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "rich.logging.RichHandler",
            "formatter": "rich",
        },
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "logs/django.log"),
            "formatter": "standard",
        },
    },
    "loggers": {
        # 'django': {
        #     'handlers': ['console', 'file'],
        #     'level': 'DEBUG',
        #     'propagate': True,
        # },
        "django.request": {
            "handlers": ["console", "file"],
            "level": "ERROR",
            "propagate": True,
        },
        "api": {  # Replace 'myapp' with the actual app name
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
