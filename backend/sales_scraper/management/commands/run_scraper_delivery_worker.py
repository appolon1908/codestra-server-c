import os
import socket
import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from sales_scraper.delivery import (
    DeliveryConfigurationError,
    deliver_once,
    require_contract,
)


class Command(BaseCommand):
    help = "Run the fail-closed authenticated scraper delivery worker"

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true")

    def handle(self, *args, **options):
        if not settings.SCRAPER_MIDDLEWARE_DELIVERY_ENABLED:
            raise CommandError("scraper_middleware_delivery_disabled")
        try:
            require_contract()
        except DeliveryConfigurationError as exc:
            raise CommandError(str(exc)) from exc
        owner = os.getenv(
            "SCRAPER_DELIVERY_WORKER_ID", f"{socket.gethostname()}:{os.getpid()}"
        )
        while True:
            handled = deliver_once(owner)
            if options["once"]:
                return
            if not handled:
                time.sleep(2)
