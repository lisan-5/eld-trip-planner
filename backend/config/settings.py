"""Django settings for the minimal backend used by the tutorial app."""
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "replace-me")

INSTALLED_APPS = [
	"django.contrib.admin",
	"django.contrib.auth",
	"django.contrib.contenttypes",
	"django.contrib.sessions",
	"django.contrib.messages",
	"django.contrib.staticfiles",

	"rest_framework",
	"corsheaders",

	"trip",
]

MIDDLEWARE = [
	"corsheaders.middleware.CorsMiddleware",
	"django.middleware.security.SecurityMiddleware",
	"django.contrib.sessions.middleware.SessionMiddleware",
	"django.middleware.common.CommonMiddleware",
	"django.middleware.csrf.CsrfViewMiddleware",
	"django.contrib.auth.middleware.AuthenticationMiddleware",
	"django.contrib.messages.middleware.MessageMiddleware",
	"django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

# Minimal template backend required by Django admin and some contrib apps
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
	}
]

WSGI_APPLICATION = "config.wsgi.application"

# Default to a simple file-based sqlite database for local development
DATABASES = {
	"default": {
		"ENGINE": "django.db.backends.sqlite3",
		"NAME": BASE_DIR / "db.sqlite3",
	}
}

# Debug and other runtime settings from env
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"

ALLOWED_HOSTS = ["*"]

CORS_ALLOWED_ORIGINS = [
	os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
]

# Allow common local dev ports (e.g. Vite may pick 5174 if 5173 is taken)
if DEBUG:
	CORS_ALLOWED_ORIGIN_REGEXES = [
		r"^http://localhost:\\d+$",
		r"^http://127\\.0\\.0\\.1:\\d+$",
	]

REST_FRAMEWORK = {
	"DEFAULT_RENDERER_CLASSES": [
		"rest_framework.renderers.JSONRenderer",
	]
}

ORS_API_KEY = os.getenv("ORS_API_KEY", "")

STATIC_URL = "static/"
