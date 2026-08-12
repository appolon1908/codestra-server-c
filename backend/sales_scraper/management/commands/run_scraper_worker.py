import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from sales_scraper.worker import run_once


class Command(BaseCommand):
    help = "Run the controlled public-web crawler worker"

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true")
        parser.add_argument("--poll-seconds", type=float, default=2.0)

    def handle(self, *args, **options):
        if not settings.SCRAPER_WORKER_ENABLED:
            raise CommandError("scraper_worker_disabled")
        while True:
            found = run_once()
            if options["once"]:
                return
            if not found:
                time.sleep(max(0.1, options["poll_seconds"]))
