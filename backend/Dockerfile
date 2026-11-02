FROM cgr.dev/chainguard/python@sha256:8a5780972067cfba4592b10e786a889807ed876c1100f89410fd0ed4e398992c AS builder

USER root
WORKDIR /build

RUN python -m venv /venv && mkdir -p /runtime-dirs/static /runtime-dirs/media
COPY requirements.txt ./
RUN /venv/bin/pip install --no-cache-dir --requirement requirements.txt \
    && /venv/bin/python -c "import sysconfig; from pathlib import Path; p=Path(sysconfig.get_path('purelib'))/'autobahn/wamp/cryptosign.py'; s=p.read_text(); begin='-----BEGIN '+'OPENSSH PRIVATE KEY-----'; end='-----END '+'OPENSSH PRIVATE KEY-----'; assert s.count(begin) == 3 and s.count(end) == 2; p.write_text(s.replace(begin, '-----BEGIN REDACTED EXAMPLE-----').replace(end, '-----END REDACTED EXAMPLE-----'))" \
    && find /venv -type d -name __pycache__ -prune -exec rm -rf '{}' + \
    && site_packages="$(/venv/bin/python -c 'import sysconfig; print(sysconfig.get_path("purelib"))')" \
    && rm -rf "$site_packages"/pip* \
        "$site_packages"/setuptools* \
        "$site_packages"/wheel*

FROM cgr.dev/chainguard/python@sha256:60e3c0d33ab77e50ace0850ccdf6eaec825ce89dad9b1ec2b0300a2070892b05


ARG VCS_REF=unknown
LABEL org.opencontainers.image.source="https://github.com/appolon1908-hue/codestra-server-c" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="Codestra controlled scraper"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/bin:/usr/sbin:/sbin:/bin

WORKDIR /app

COPY --from=builder --chown=65532:65532 /venv /venv
COPY --from=builder --chown=65532:65532 /runtime-dirs/ /app/
COPY --chown=65532:65532 . .

USER 65532:65532
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["/venv/bin/python", "-c", "import os,urllib.request; r=urllib.request.Request('http://127.0.0.1:8000/healthz/',headers={'Host':os.getenv('HEALTHCHECK_HOST','localhost')}); assert urllib.request.urlopen(r,timeout=4).status == 200"]

ENTRYPOINT ["/venv/bin/python", "/app/docker_entrypoint.py"]
CMD ["gunicorn", "CORE.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
