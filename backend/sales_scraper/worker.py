import os
import socket

from .crawler import claim_job, process_job


def run_once():
    owner = os.getenv("SCRAPER_WORKER_ID", f"{socket.gethostname()}:{os.getpid()}")
    job = claim_job(owner, int(os.getenv("SCRAPER_LEASE_SECONDS", "60")))
    if job:
        process_job(job)
    return bool(job)
