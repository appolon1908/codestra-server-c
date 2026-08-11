FROM cgr.dev/chainguard/python@sha256:4c58eb78b47d5a7cee9ffe0d1df16c56778ee40b067d983fb48d677a035abf8c AS builder

USER root
WORKDIR /build

RUN python -m venv /venv && mkdir -p /runtime-dirs/static /runtime-dirs/media
COPY requirements.txt ./
RUN /venv/bin/pip install --no-cache-dir --requirement requirements.txt \
    && rm -rf /venv/lib/python3.14/site-packages/pip* \
        /venv/lib/python3.14/site-packages/setuptools* \
        /venv/lib/python3.14/site-packages/wheel*

FROM cgr.dev/chainguard/python@sha256:69437de912cc3b5d36a2480b8fb0c3f658f151d8bc1978d19a6412be3a4983d5

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
