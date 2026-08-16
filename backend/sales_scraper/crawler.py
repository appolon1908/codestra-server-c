from __future__ import annotations

import hashlib
import ssl
import time
from dataclasses import dataclass
from datetime import timedelta
from urllib.parse import urljoin, urlsplit
from urllib.robotparser import RobotFileParser

import urllib3
from django.db import transaction
from django.utils import timezone

from .extraction import extract_lead
from .models import CrawlDomainState, CrawlJob, CrawlPage, LeadCandidate
from .outbox import enqueue_candidate
from .security import UnsafeURL, validate_dns_pin, validate_public_url

ALLOWED_CONTENT_TYPES = {"text/html", "application/xhtml+xml"}
EXECUTABLE_TYPES = {
    "application/x-executable",
    "application/x-msdownload",
    "application/java-archive",
    "application/x-sh",
    "application/vnd.microsoft.portable-executable",
}
USER_AGENT = "CodestraControlledCrawler/1.0 (+public-web-research; respects robots.txt)"


@dataclass
class FetchResult:
    url: str
    status: int
    headers: dict[str, str]
    body: bytes


class CrawlError(RuntimeError):
    def __init__(self, code: str, retryable: bool = False):
        super().__init__(code)
        self.code, self.retryable = code, retryable


class PinnedFetcher:
    def __init__(
        self, timeout=10.0, max_bytes=2_000_000, max_redirects=5, resolver=None
    ):
        self.timeout, self.max_bytes, self.max_redirects, self.resolver = (
            timeout,
            max_bytes,
            max_redirects,
            resolver,
        )

    def fetch(self, url: str) -> FetchResult:
        current = url
        for _ in range(self.max_redirects + 1):
            resolved = (
                validate_public_url(current, self.resolver)
                if self.resolver
                else validate_public_url(current)
            )
            validate_dns_pin(
                resolved, self.resolver
            ) if self.resolver else validate_dns_pin(resolved)
            parsed, ip = urlsplit(resolved.url), resolved.addresses[0]
            headers = {
                "Host": resolved.host,
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml",
            }
            timeout = urllib3.Timeout(connect=self.timeout, read=self.timeout)
            if parsed.scheme == "https":
                pool: urllib3.HTTPConnectionPool = urllib3.HTTPSConnectionPool(
                    ip,
                    port=resolved.port,
                    assert_hostname=resolved.host,
                    server_hostname=resolved.host,
                    cert_reqs=ssl.CERT_REQUIRED,
                    timeout=timeout,
                    maxsize=1,
                )
            else:
                pool = urllib3.HTTPConnectionPool(
                    ip, port=resolved.port, timeout=timeout, maxsize=1
                )
            try:
                response = pool.urlopen(
                    "GET",
                    parsed.path + (("?" + parsed.query) if parsed.query else ""),
                    headers=headers,
                    redirect=False,
                    preload_content=False,
                    retries=False,
                )
                if response.status in {301, 302, 303, 307, 308}:
                    location = response.headers.get("Location")
                    response.release_conn()
                    if not location:
                        raise CrawlError("redirect_without_location")
                    current = urljoin(resolved.url, location)
                    continue
                try:
                    declared = int(response.headers.get("Content-Length", "0") or 0)
                except (TypeError, ValueError) as exc:
                    response.release_conn()
                    raise CrawlError("invalid_content_length") from exc
                if declared > self.max_bytes:
                    response.release_conn()
                    raise CrawlError("response_too_large")
                body = response.read(self.max_bytes + 1)
                response.release_conn()
                if len(body) > self.max_bytes:
                    raise CrawlError("response_too_large")
                return FetchResult(
                    resolved.url,
                    response.status,
                    {str(k): str(v) for k, v in response.headers.items()},
                    body,
                )
            except (
                urllib3.exceptions.TimeoutError,
                urllib3.exceptions.HTTPError,
                OSError,
            ) as exc:
                raise CrawlError("network_timeout_or_error", retryable=True) from exc
        raise CrawlError("redirect_limit")


class RobotsPolicy:
    def __init__(self, fetcher):
        self.fetcher, self.cache = fetcher, {}

    def allowed(self, url: str) -> bool:
        parsed = urlsplit(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self.cache:
            robots_url = origin + "/robots.txt"
            try:
                result = self.fetcher.fetch(robots_url)
                if result.status in {401, 403}:
                    lines = ["User-agent: *", "Disallow: /"]
                elif result.status >= 500:
                    raise CrawlError("robots_temporarily_unavailable", retryable=True)
                else:
                    lines = (
                        result.body.decode("utf-8", "replace").splitlines()
                        if result.status < 400
                        else []
                    )
            except CrawlError as exc:
                if exc.retryable:
                    raise
                lines = ["User-agent: *", "Disallow: /"]
            parser = RobotFileParser()
            parser.set_url(robots_url)
            parser.parse(lines)
            self.cache[origin] = parser
        return self.cache[origin].can_fetch(USER_AGENT, url)


class DomainLimiter:
    def __init__(self, delay_seconds=1.0, clock=time.monotonic, sleeper=time.sleep):
        self.delay, self.clock, self.sleeper, self.last = (
            delay_seconds,
            clock,
            sleeper,
            {},
        )

    def wait(self, host: str):
        elapsed = self.clock() - self.last.get(host, -self.delay)
        if elapsed < self.delay:
            self.sleeper(self.delay - elapsed)
        self.last[host] = self.clock()


class DatabaseDomainLimiter:
    def __init__(self, delay_seconds=1.0, clock=timezone.now, sleeper=time.sleep):
        self.delay, self.clock, self.sleeper = delay_seconds, clock, sleeper

    def wait(self, host: str):
        current = self.clock()
        with transaction.atomic():
            row, _ = CrawlDomainState.objects.select_for_update().get_or_create(
                domain=host, defaults={"next_allowed_at": current}
            )
            wait_seconds = max(0.0, (row.next_allowed_at - current).total_seconds())
            row.next_allowed_at = max(current, row.next_allowed_at) + timedelta(
                seconds=self.delay
            )
            row.save(update_fields=["next_allowed_at", "updated_at"])
        if wait_seconds:
            self.sleeper(wait_seconds)


def claim_job(owner: str, lease_seconds: int = 60):
    now = timezone.now()
    with transaction.atomic():
        job = (
            CrawlJob.objects.select_for_update(skip_locked=True)
            .filter(
                state__in=[
                    CrawlJob.State.QUEUED,
                    CrawlJob.State.RETRY_WAIT,
                    CrawlJob.State.LEASED,
                ]
            )
            .filter(models_q_claimable(now))
            .order_by("created_at")
            .first()
        )
        if not job:
            return None
        job.state, job.lease_owner, job.lease_expires_at = (
            CrawlJob.State.LEASED,
            owner,
            now + timedelta(seconds=lease_seconds),
        )
        job.save(
            update_fields=["state", "lease_owner", "lease_expires_at", "updated_at"]
        )
        return job


def models_q_claimable(now):
    from django.db.models import Q

    return (
        Q(state=CrawlJob.State.QUEUED)
        | Q(state=CrawlJob.State.RETRY_WAIT, next_attempt_at__lte=now)
        | Q(state=CrawlJob.State.LEASED, lease_expires_at__lte=now)
    )


def process_job(job: CrawlJob, fetcher=None, robots=None, limiter=None):
    policy = {"max_depth": 2, "max_pages": 25, "max_bytes": 2_000_000, **job.policy}
    fetcher = fetcher or PinnedFetcher(
        timeout=policy.get("timeout_seconds", 10),
        max_bytes=policy["max_bytes"],
        max_redirects=policy.get("max_redirects", 5),
    )
    robots, limiter = (
        robots or RobotsPolicy(fetcher),
        limiter or DatabaseDomainLimiter(policy.get("per_domain_delay_seconds", 1.0)),
    )
    queue, seen = [(url, 0) for url in job.start_urls], set[str]()
    deadline = time.monotonic() + policy.get("max_total_duration_seconds", 300)
    job.state = CrawlJob.State.RUNNING
    job.attempts += 1
    job.save(update_fields=["state", "attempts", "updated_at"])
    try:
        while queue and len(seen) < policy["max_pages"]:
            if time.monotonic() >= deadline:
                raise CrawlError("job_duration_limit")
            job.refresh_from_db(fields=["cancel_requested_at"])
            if job.cancel_requested_at:
                job.state = CrawlJob.State.CANCELLED
                job.completed_at = timezone.now()
                job.save(update_fields=["state", "completed_at", "updated_at"])
                return
            url, depth = queue.pop(0)
            if url in seen or depth > policy["max_depth"]:
                continue
            seen.add(url)
            page, _ = CrawlPage.objects.get_or_create(
                job=job, url=url, defaults={"depth": depth}
            )
            try:
                validate_public_url(url)
                if not robots.allowed(url):
                    raise CrawlError("robots_denied")
                limiter.wait(urlsplit(url).hostname or "")
                result = fetcher.fetch(url)
                content_type = (
                    result.headers.get("Content-Type", "").split(";", 1)[0].lower()
                )
                if (
                    content_type in EXECUTABLE_TYPES
                    or content_type not in ALLOWED_CONTENT_TYPES
                ):
                    raise CrawlError("unsupported_content_type")
                retrieved = timezone.now()
                contract, links = extract_lead(
                    result.url, result.body, retrieved.isoformat()
                )
                (
                    page.status_code,
                    page.content_type,
                    page.content_hash,
                    page.retrieved_at,
                ) = (
                    result.status,
                    content_type,
                    hashlib.sha256(result.body).hexdigest(),
                    retrieved,
                )
                page.save()
                domain = contract["company"]["domain"]
                identity_hash = hashlib.sha256(
                    f"{job.tenant_id}|{job.campaign_id}|{domain}".encode()
                ).hexdigest()
                contract.update(
                    {
                        "tenant_id": str(job.tenant_id),
                        "campaign_id": str(job.campaign_id),
                        "idempotency": {
                            "job_key_hash": job.idempotency_key_hash,
                            "candidate_identity_hash": identity_hash,
                        },
                    }
                )
                with transaction.atomic():
                    candidate, created = LeadCandidate.objects.update_or_create(
                        tenant_id=job.tenant_id,
                        campaign_id=job.campaign_id,
                        normalized_identity_hash=identity_hash,
                        defaults={
                            "job": job,
                            "company_domain": domain,
                            "contract": contract,
                        },
                    )
                    if created:
                        enqueue_candidate(candidate)
                if depth < policy["max_depth"]:
                    queue.extend(
                        (link, depth + 1)
                        for link in links
                        if urlsplit(link).hostname == urlsplit(result.url).hostname
                    )
            except (UnsafeURL, CrawlError, ValueError) as exc:
                page.rejection_reason = getattr(exc, "code", str(exc))[:120]
                page.save(update_fields=["rejection_reason"])
                if isinstance(exc, CrawlError) and exc.retryable:
                    raise
        job.state, job.completed_at, job.lease_owner, job.lease_expires_at = (
            CrawlJob.State.COMPLETED,
            timezone.now(),
            None,
            None,
        )
        job.save(
            update_fields=[
                "state",
                "completed_at",
                "lease_owner",
                "lease_expires_at",
                "updated_at",
            ]
        )
    except Exception as exc:
        job.failure_code, job.failure_detail = type(exc).__name__, str(exc)[:500]
        job.lease_owner = None
        job.lease_expires_at = None
        if job.attempts >= job.max_attempts:
            job.state = CrawlJob.State.DEAD_LETTER
        else:
            job.state, job.next_attempt_at = (
                CrawlJob.State.RETRY_WAIT,
                timezone.now() + timedelta(seconds=min(300, 2**job.attempts)),
            )
        job.save()
        raise
