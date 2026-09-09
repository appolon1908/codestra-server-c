"""Disposable CI database only; never defaults to a production address."""
import os
from .test_settings import *  # noqa: F403

if os.environ.get("GITHUB_ACTIONS") != "true":
    raise RuntimeError("PostgreSQL concurrency test settings require hosted CI")
DATABASES = {"default": {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": "scraper_certification",
    "USER": "scraper_certification",
    "PASSWORD": os.environ["TEST_DATABASE_PASSWORD"],
    "HOST": "127.0.0.1",
    "PORT": "5432",
}}
