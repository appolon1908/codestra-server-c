FROM cgr.dev/chainguard/python@sha256:de669347e9c1348d3fb952b1ab93738412bd7207769a882701691825741bfce3 AS builder

USER root
WORKDIR /build

RUN python -m venv /venv && mkdir -p /runtime-dirs/static /runtime-dirs/media
COPY requirements.txt ./
RUN /venv/bin/pip install --no-cache-dir --requirement requirements.txt \
    && /venv/bin/python -c "from pathlib import Path; p=Path('/venv/lib/python3.14/site-packages/autobahn/wamp/cryptosign.py'); s=p.read_text(); begin='-----BEGIN '+'OPENSSH PRIVATE KEY-----'; end='-----END '+'OPENSSH PRIVATE KEY-----'; assert s.count(begin) == 3 and s.count(end) == 2; p.write_text(s.replace(begin, '-----BEGIN REDACTED EXAMPLE-----').replace(end, '-----END REDACTED EXAMPLE-----'))" \
    && find /venv -type d -name __pycache__ -prune -exec rm -rf '{}' + \
    && rm -rf /venv/lib/python3.14/site-packages/pip* \
        /venv/lib/python3.14/site-packages/setuptools* \
        /venv/lib/python3.14/site-packages/wheel*

FROM cgr.dev/chainguard/python@sha256:1f37785e5cdb70151f36aaa15e1e3cef4571424dbefbf4b0d8a9222535cb13ff

ARG VCS_REF=unknown
LABEL org.opencontainers.image.source="https://github.com/Codestra-SRL/codestra-server-c" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.title="Codestra controlled scraper"

ARG VCS_REF=unknown
LABEL org.opencontainers.image.source="https://github.com/Codestra-SRL/codestra-server-c" \
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
