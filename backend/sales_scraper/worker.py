import os
import socket

from django.conf import settings

from .crawler import claim_job, process_job


def run_once():
    if not settings.SCRAPER_WORKER_ENABLED:
        return False
    owner = os.getenv("SCRAPER_WORKER_ID", f"{socket.gethostname()}:{os.getpid()}")
    job = claim_job(owner, int(os.getenv("SCRAPER_LEASE_SECONDS", "60")))
    if job:
        process_job(job)
    return bool(job)
